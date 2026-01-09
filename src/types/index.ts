// Severity levels for vulnerabilities
export type Severity = 'critical' | 'high' | 'medium' | 'low';

// Types of vulnerabilities we can detect
export type VulnerabilityType =
  | 'api_key_exposed'
  | 'env_file_exposed'
  | 'git_exposed'
  | 'source_map_exposed'
  | 'config_exposed'
  | 'missing_security_header'
  | 'insecure_protocol'
  | 'mixed_content'
  | 'bearer_token_exposed'
  | 'credentials_in_url'
  | 'credential_in_request'
  | 'credential_in_url'
  | 'api_key_in_url'
  | 'api_key_in_request'
  | 'cors_misconfiguration'
  | 'admin_panel_exposed'
  | 'debug_endpoint_exposed'
  | 'database_exposed'
  | 'backup_exposed'
  | 'log_exposed';

// Detected vulnerability
export interface Vulnerability {
  id: string;
  type: VulnerabilityType;
  severity: Severity;
  title: string;
  description: string;
  patternKey?: string; // Key for i18n translations (e.g., "openai", "stripe_live", "header_csp")
  location?: string;
  lineNumber?: number;
  foundValue?: string; // Sanitized value (partial)
  fullValue?: string; // Full value (only shown in paid version)
  remediation: {
    steps: string[];
    codeExample?: {
      bad: string;
      good: string;
    };
  };
}

// Scan status
export type ScanStatus = 'pending' | 'scanning' | 'completed' | 'failed';

// Scan step for progress tracking
export interface ScanStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

// Scan results
export interface ScanResults {
  id: string;
  url: string;
  score: number;
  status: ScanStatus;
  vulnerabilities: Vulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  isPaid: boolean;
  scannedAt: string;
  completedAt?: string;
}

// Database types for Supabase
export interface DbScan {
  id: string;
  url: string;
  score: number | null;
  status: ScanStatus;
  results: Vulnerability[] | null;
  is_paid: boolean;
  stripe_session_id: string | null;
  created_at: string;
  completed_at: string | null;
  ip_address: string | null;
}

export interface DbPayment {
  id: string;
  scan_id: string;
  stripe_payment_id: string | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// API response types
export interface ScanResponse {
  success: boolean;
  scanId?: string;
  error?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

// Pattern definition for API key detection
export interface ApiKeyPattern {
  name: string;
  provider: string;
  patternKey?: string; // Key for i18n translations (derived from provider if not specified)
  pattern: RegExp;
  severity: Severity;
  description: string;
  remediation: {
    steps: string[];
    revokeUrl?: string;
    codeExample?: {
      bad: string;
      good: string;
    };
  };
}

// Security header check
export interface SecurityHeader {
  name: string;
  patternKey?: string; // Key for i18n translations (derived from name if not specified)
  importance: Severity;
  description: string;
  recommendation: string;
}

// Sensitive file check
export interface SensitiveFile {
  path: string;
  severity: Severity;
  description: string;
}
