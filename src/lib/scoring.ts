import type { Vulnerability, Severity } from '@/types';

// Points deducted for each severity level
const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 25, // Critical issues heavily impact score
  high: 15,     // High severity issues
  medium: 8,    // Medium severity issues
  low: 3,       // Low severity issues have minimal impact
};

// Maximum deduction per category to prevent single category from dominating
const MAX_CATEGORY_DEDUCTION = 40;

// Calculate security score from vulnerabilities (0-100)
export function calculateScore(vulnerabilities: Vulnerability[]): number {
  if (vulnerabilities.length === 0) {
    return 100; // Perfect score if no vulnerabilities
  }

  // Group vulnerabilities by severity
  const bySeverity: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const vuln of vulnerabilities) {
    bySeverity[vuln.severity]++;
  }

  // Calculate deductions for each severity level
  let totalDeduction = 0;

  for (const [severity, count] of Object.entries(bySeverity)) {
    const weight = SEVERITY_WEIGHTS[severity as Severity];
    const deduction = Math.min(count * weight, MAX_CATEGORY_DEDUCTION);
    totalDeduction += deduction;
  }

  // Ensure score is between 0 and 100
  const score = Math.max(0, Math.min(100, 100 - totalDeduction));

  return Math.round(score);
}

// Get risk level label based on score
export function getRiskLevel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 90) {
    return {
      label: 'Excelente',
      color: 'green',
      description: 'Tu sitio tiene una buena postura de seguridad.',
    };
  }
  if (score >= 70) {
    return {
      label: 'Bueno',
      color: 'lime',
      description: 'Algunos problemas menores detectados.',
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderado',
      color: 'yellow',
      description: 'Se encontraron vulnerabilidades que deberías revisar.',
    };
  }
  if (score >= 30) {
    return {
      label: 'En Riesgo',
      color: 'orange',
      description: 'Vulnerabilidades importantes detectadas. Acción recomendada.',
    };
  }
  return {
    label: 'Crítico',
    color: 'red',
    description: 'Vulnerabilidades críticas encontradas. Acción urgente necesaria.',
  };
}

// Get summary statistics for display
export function getSummaryStats(vulnerabilities: Vulnerability[]): {
  total: number;
  bySeverity: Record<Severity, number>;
  mostSevere: Severity | null;
} {
  const bySeverity: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const vuln of vulnerabilities) {
    bySeverity[vuln.severity]++;
  }

  // Find most severe category with issues
  let mostSevere: Severity | null = null;
  const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low'];
  for (const severity of severityOrder) {
    if (bySeverity[severity] > 0) {
      mostSevere = severity;
      break;
    }
  }

  return {
    total: vulnerabilities.length,
    bySeverity,
    mostSevere,
  };
}

// Format score for display
export function formatScore(score: number): string {
  return `${score}/100`;
}

// Get color class for severity
export function getSeverityColor(severity: Severity): string {
  const colors: Record<Severity, string> = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    high: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    low: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  };
  return colors[severity];
}

// Get severity badge color
export function getSeverityBadgeColor(severity: Severity): string {
  const colors: Record<Severity, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };
  return colors[severity];
}

// Get severity label in Spanish
export function getSeverityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
  };
  return labels[severity];
}

// Get score gradient color
export function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-emerald-500';
  if (score >= 60) return 'from-lime-500 to-green-500';
  if (score >= 40) return 'from-yellow-500 to-lime-500';
  if (score >= 20) return 'from-orange-500 to-yellow-500';
  return 'from-red-500 to-orange-500';
}
