import puppeteerCore, { Browser, HTTPRequest, HTTPResponse } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { v4 as uuidv4 } from 'uuid';
import { rm } from 'fs/promises';
import type { Vulnerability, VulnerabilityType, ScanResults } from '@/types';
import {
  API_KEY_PATTERNS,
  SECURITY_HEADERS,
  SENSITIVE_FILES,
  sanitizeKey,
  isLikelyRealKey,
} from './patterns';
import { calculateScore } from './scoring';

const TOTAL_SCAN_TIMEOUT = 60000;
const PAGE_LOAD_TIMEOUT = 30000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

interface NetworkRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
}

interface ScanContext {
  url: string;
  baseUrl: string;
  vulnerabilities: Vulnerability[];
  htmlContent: string;
  jsContents: Map<string, string>;
  responseHeaders: Record<string, string>;
  networkRequests: NetworkRequest[];
}

export class SecurityScanner {
  private ctx: ScanContext;
  private browser: Browser | null = null;
  private tmpDir: string | null = null;

  constructor(url: string) {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const urlObj = new URL(normalizedUrl);
    this.ctx = {
      url: normalizedUrl,
      baseUrl: `${urlObj.protocol}//${urlObj.host}`,
      vulnerabilities: [],
      htmlContent: '',
      jsContents: new Map(),
      responseHeaders: {},
      networkRequests: [],
    };
  }

  async scan(): Promise<ScanResults> {
    const scanId = uuidv4();

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Scan timeout')), TOTAL_SCAN_TIMEOUT);
      });

      const scanPromise = this.performScan();
      await Promise.race([scanPromise, timeoutPromise]);

      const score = calculateScore(this.ctx.vulnerabilities);

      const summary = {
        critical: this.ctx.vulnerabilities.filter((v) => v.severity === 'critical').length,
        high: this.ctx.vulnerabilities.filter((v) => v.severity === 'high').length,
        medium: this.ctx.vulnerabilities.filter((v) => v.severity === 'medium').length,
        low: this.ctx.vulnerabilities.filter((v) => v.severity === 'low').length,
        total: this.ctx.vulnerabilities.length,
      };

      return {
        id: scanId,
        url: this.ctx.url,
        score,
        status: 'completed',
        vulnerabilities: this.ctx.vulnerabilities,
        summary,
        isPaid: false,
        scannedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Scan error:', error);
      return {
        id: scanId,
        url: this.ctx.url,
        score: 0,
        status: 'failed',
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
        isPaid: false,
        scannedAt: new Date().toISOString(),
      };
    } finally {
      await this.closeBrowser();
    }
  }

  private async performScan(): Promise<void> {
    // Step 1: Launch browser and load page (captures network requests)
    await this.loadPageWithBrowser();

    // Step 2: Scan HTML for API keys
    await this.scanForApiKeys(this.ctx.htmlContent, 'HTML Source');

    // Step 3: Scan all captured JS content
    for (const [jsUrl, content] of this.ctx.jsContents) {
      await this.scanForApiKeys(content, jsUrl);
    }

    // Step 4: Analyze network requests for exposed credentials
    this.analyzeNetworkRequests();

    // Step 5: Check security headers
    this.checkSecurityHeaders();

    // Step 6: Check for sensitive files
    await this.checkSensitiveFiles();

    // Step 7: Check HTTPS
    this.checkHttpsSecurity();
  }

  private async loadPageWithBrowser(): Promise<void> {
    console.log('[Scanner] Launching browser... IS_PRODUCTION:', IS_PRODUCTION);

    if (IS_PRODUCTION) {
      // Vercel serverless - usar @sparticuz/chromium
      this.browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: chromium.headless as boolean,
      });
    } else {
      // Desarrollo local - usar Chrome instalado
      this.tmpDir = `/tmp/puppeteer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      console.log('[Scanner] Using temp dir:', this.tmpDir);

      this.browser = await puppeteerCore.launch({
        headless: true,
        userDataDir: this.tmpDir,
        executablePath: process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : '/usr/bin/google-chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-application-cache',
          '--disable-cache',
          '--disk-cache-size=0',
          '--media-cache-size=0',
          '--aggressive-cache-discard',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-sync',
          '--no-first-run',
          '--blink-settings=imagesEnabled=true',
        ],
      });
    }

    // Usar contexto incognito para maximo aislamiento
    const context = await this.browser.createBrowserContext();
    const page = await context.newPage();

    // Deshabilitar cache completamente
    await page.setCacheEnabled(false);

    // Limpiar todo via CDP
    const client = await page.createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.clearBrowserCache');
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Intercept all requests
    await page.setRequestInterception(true);

    page.on('request', (request: HTTPRequest) => {
      const requestData: NetworkRequest = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData() || undefined,
      };
      this.ctx.networkRequests.push(requestData);
      request.continue();
    });

    // Capture JS file contents and headers
    page.on('response', async (response: HTTPResponse) => {
      try {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';

        // Capture main page headers
        if (url === this.ctx.url || url === this.ctx.url + '/') {
          this.ctx.responseHeaders = response.headers();
        }

        // Capture JS files
        if (contentType.includes('javascript') || url.endsWith('.js')) {
          try {
            const text = await response.text();
            if (text && text.length > 0) {
              this.ctx.jsContents.set(url, text);
            }
          } catch {
            // Some responses can't be read
          }
        }
      } catch {
        // Ignore errors
      }
    });

    console.log('[Scanner] Loading page:', this.ctx.url);

    try {
      // First load with networkidle0 (stricter - waits for 0 connections for 500ms)
      await page.goto(this.ctx.url, {
        waitUntil: 'networkidle0',
        timeout: PAGE_LOAD_TIMEOUT,
      });

      // Wait for any lazy-loaded content and JS execution
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get final HTML
      this.ctx.htmlContent = await page.content();

      console.log(`[Scanner] Captured ${this.ctx.networkRequests.length} network requests`);
      console.log(`[Scanner] Captured ${this.ctx.jsContents.size} JS files`);

    } catch (error) {
      console.error('[Scanner] Error loading page:', error);
      throw error;
    }
  }

  private analyzeNetworkRequests(): void {
    console.log('[Scanner] Analyzing network requests for exposed credentials...');

    for (const req of this.ctx.networkRequests) {
      // Check Authorization headers
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      if (authHeader) {
        if (authHeader.startsWith('Bearer ') && authHeader.length > 50) {
          const token = authHeader.replace('Bearer ', '');

          if (this.isExposedCredential(token)) {
            this.addVulnerability({
              id: uuidv4(),
              type: 'credential_in_request',
              severity: 'critical',
              title: 'Bearer Token Exposed in Network Request',
              description: `A Bearer token is being sent from the frontend. This token is visible in browser dev tools and can be stolen.`,
              location: req.url,
              foundValue: sanitizeKey(token),
              fullValue: token,
              remediation: {
                steps: [
                  'Move authentication to server-side (API routes)',
                  'Use httpOnly cookies instead of Authorization headers',
                  'Implement a backend proxy for authenticated requests',
                  'Never store or send tokens from client-side JavaScript',
                ],
              },
            });
          }
        }
      }

      // Check for API keys in URL query parameters
      try {
        const urlObj = new URL(req.url);
        const params = urlObj.searchParams;

        const sensitiveParams = ['api_key', 'apikey', 'key', 'token', 'secret', 'password', 'auth', 'access_token'];

        for (const [param, value] of params) {
          const paramLower = param.toLowerCase();
          if (sensitiveParams.some(s => paramLower.includes(s)) && value.length > 10) {
            this.addVulnerability({
              id: uuidv4(),
              type: 'credential_in_url',
              severity: 'critical',
              title: `Sensitive Parameter "${param}" in URL`,
              description: `A sensitive value is passed in URL query parameters. URLs are logged in browser history, server logs, and leaked via Referer headers.`,
              location: req.url.split('?')[0],
              foundValue: `${param}=${sanitizeKey(value)}`,
              fullValue: `${param}=${value}`,
              remediation: {
                steps: [
                  'Never pass sensitive data in URL query parameters',
                  'Use POST requests with body data instead',
                  'Move authentication to server-side',
                  'Use secure headers for authentication',
                ],
              },
            });
          }
        }

        // Check for API keys patterns in full URL
        for (const pattern of API_KEY_PATTERNS) {
          pattern.pattern.lastIndex = 0;
          const match = pattern.pattern.exec(req.url);
          if (match && isLikelyRealKey(match[0], pattern)) {
            this.addVulnerability({
              id: uuidv4(),
              type: 'api_key_in_url',
              severity: 'critical',
              title: `${pattern.name} in Network Request URL`,
              description: `${pattern.description} Found in a request URL made by your application.`,
              location: req.url.split('?')[0],
              foundValue: sanitizeKey(match[0]),
              fullValue: match[0],
              remediation: pattern.remediation,
            });
          }
        }
      } catch {
        // Invalid URL, skip
      }

      // Check POST data for credentials
      if (req.postData) {
        for (const pattern of API_KEY_PATTERNS) {
          pattern.pattern.lastIndex = 0;
          const match = pattern.pattern.exec(req.postData);
          if (match && isLikelyRealKey(match[0], pattern)) {
            this.addVulnerability({
              id: uuidv4(),
              type: 'api_key_in_request',
              severity: 'critical',
              title: `${pattern.name} in Request Body`,
              description: `${pattern.description} Found in a POST request body sent from your frontend.`,
              location: req.url,
              foundValue: sanitizeKey(match[0]),
              fullValue: match[0],
              remediation: pattern.remediation,
            });
          }
        }
      }
    }
  }

  private isExposedCredential(token: string): boolean {
    if (token.length < 20) return false;
    if (/xxx|placeholder|example|test|demo|sample/i.test(token)) return false;

    // Check if it looks like a real JWT or API key
    const isJwt = token.split('.').length === 3;
    const hasEntropy = /[a-zA-Z]/.test(token) && /[0-9]/.test(token);

    return isJwt || (hasEntropy && token.length > 30);
  }

  private async scanForApiKeys(content: string, location: string): Promise<void> {
    for (const pattern of API_KEY_PATTERNS) {
      pattern.pattern.lastIndex = 0;

      let match;
      while ((match = pattern.pattern.exec(content)) !== null) {
        const foundKey = match[0];

        if (!isLikelyRealKey(foundKey, pattern)) {
          continue;
        }

        const beforeMatch = content.substring(0, match.index);
        const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

        this.addVulnerability({
          id: uuidv4(),
          type: 'api_key_exposed',
          severity: pattern.severity,
          title: `${pattern.name} Exposed`,
          description: pattern.description,
          location,
          lineNumber,
          foundValue: sanitizeKey(foundKey),
          fullValue: foundKey,
          remediation: pattern.remediation,
        });
      }
    }
  }

  private checkSecurityHeaders(): void {
    const headers = Object.keys(this.ctx.responseHeaders).map((h) => h.toLowerCase());

    for (const header of SECURITY_HEADERS) {
      const headerLower = header.name.toLowerCase();
      if (!headers.includes(headerLower)) {
        this.addVulnerability({
          id: uuidv4(),
          type: 'missing_security_header',
          severity: header.importance,
          title: `Missing ${header.name} Header`,
          description: header.description,
          remediation: {
            steps: [header.recommendation],
          },
        });
      }
    }
  }

  private async checkSensitiveFiles(): Promise<void> {
    const filesToCheck = SENSITIVE_FILES.slice(0, 10);

    for (const file of filesToCheck) {
      try {
        const fileUrl = this.ctx.baseUrl + file.path;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 SecureScan' },
          redirect: 'manual',
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.status === 200) {
          const text = await response.text();

          // Check if it's real content (not error page)
          if (!text.includes('<!DOCTYPE') && !text.includes('<!doctype') &&
              !text.toLowerCase().includes('not found') && text.length > 10) {

            let vulnType: VulnerabilityType = 'config_exposed';
            if (file.path.includes('.env')) vulnType = 'env_file_exposed';
            else if (file.path.includes('.git')) vulnType = 'git_exposed';

            this.addVulnerability({
              id: uuidv4(),
              type: vulnType,
              severity: file.severity,
              title: `Sensitive File Accessible: ${file.path}`,
              description: `${file.description} is publicly accessible.`,
              location: fileUrl,
              remediation: {
                steps: [
                  `Block access to ${file.path} in your web server config`,
                  'Add to .gitignore and remove from version control',
                  'Use environment variables instead of config files',
                  'Configure hosting platform to deny access to sensitive files',
                ],
              },
            });
          }
        }
      } catch {
        // File not accessible - good
      }
    }
  }

  private checkHttpsSecurity(): void {
    const url = new URL(this.ctx.url);

    if (url.protocol === 'http:') {
      this.addVulnerability({
        id: uuidv4(),
        type: 'insecure_protocol',
        severity: 'medium',
        title: 'Site Using HTTP Instead of HTTPS',
        description: 'Your site is accessible via HTTP, which transmits data unencrypted.',
        remediation: {
          steps: [
            'Obtain an SSL certificate (free from Let\'s Encrypt)',
            'Configure your server to redirect HTTP to HTTPS',
            'Add HSTS header to enforce HTTPS',
          ],
        },
      });
    }

    // Check for mixed content in HTML
    if (this.ctx.url.startsWith('https://') && this.ctx.htmlContent) {
      const httpPattern = /http:\/\/[^"'\s]+\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)/gi;
      const matches = this.ctx.htmlContent.match(httpPattern);

      if (matches && matches.length > 0) {
        this.addVulnerability({
          id: uuidv4(),
          type: 'mixed_content',
          severity: 'low',
          title: 'Mixed Content Detected',
          description: 'Your HTTPS page loads resources over HTTP, which can be intercepted.',
          remediation: {
            steps: [
              'Update all resource URLs to use HTTPS',
              'Use protocol-relative URLs (//) where appropriate',
              'Enable upgrade-insecure-requests in CSP',
            ],
          },
        });
      }
    }
  }

  private addVulnerability(vuln: Vulnerability): void {
    const isDuplicate = this.ctx.vulnerabilities.some(
      (v) => v.type === vuln.type && v.title === vuln.title && v.foundValue === vuln.foundValue
    );

    if (!isDuplicate) {
      this.ctx.vulnerabilities.push(vuln);
    }
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {
        // Ignore close errors
      }
      this.browser = null;
    }

    // Limpiar directorio temporal
    if (this.tmpDir) {
      try {
        await rm(this.tmpDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
      this.tmpDir = null;
    }
  }
}

export function isValidUrl(url: string): boolean {
  try {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    new URL(normalizedUrl);
    return true;
  } catch {
    return false;
  }
}

export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(normalizedUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 SecureScan' },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
