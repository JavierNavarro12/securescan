import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SecurityScanner, isValidUrl } from '@/lib/scanner';
import { db } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Request validation schema
const scanRequestSchema = z.object({
  url: z.string().min(1, 'URL is required'),
});

// Rate limit: 5 scans per IP per hour
const MAX_SCANS_PER_HOUR = 5;

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = scanRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'URL inválida' },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Formato de URL inválido' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIp = getClientIp(request.headers);

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp, MAX_SCANS_PER_HOUR);
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Límite de escaneos alcanzado. Intenta de nuevo en ${resetMinutes} minutos.`,
        },
        { status: 429 }
      );
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Cache disabled - always perform fresh scan with Puppeteer
    // const recentScan = await db.getRecentScan(normalizedUrl);
    // if (recentScan) {
    //   return NextResponse.json({
    //     success: true,
    //     scanId: recentScan.id,
    //     cached: true,
    //   });
    // }

    // Create new scan record
    const scanRecord = await db.createScan(normalizedUrl, clientIp);
    if (!scanRecord) {
      return NextResponse.json(
        { success: false, error: 'Error al iniciar el escaneo' },
        { status: 500 }
      );
    }

    // Start scanning in background
    performScan(scanRecord.id, normalizedUrl);

    return NextResponse.json({
      success: true,
      scanId: scanRecord.id,
      cached: false,
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Perform scan in background (non-blocking)
async function performScan(scanId: string, url: string) {
  try {
    // Update status to scanning
    await db.updateScan(scanId, { status: 'scanning' });

    // Run the scanner
    const scanner = new SecurityScanner(url);
    const results = await scanner.scan();

    // Update scan with results
    await db.updateScan(scanId, {
      status: 'completed',
      score: results.score,
      results: results.vulnerabilities,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scan execution error:', error);

    // Mark scan as failed
    await db.updateScan(scanId, {
      status: 'failed',
      completed_at: new Date().toISOString(),
    });
  }
}
