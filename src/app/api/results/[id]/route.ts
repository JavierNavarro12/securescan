import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import type { ScanResults, Vulnerability } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scanId } = await params;

    if (!scanId) {
      return NextResponse.json(
        { success: false, error: 'ID de escaneo requerido' },
        { status: 400 }
      );
    }

    // Get scan from database
    const scan = await db.getScan(scanId);

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Escaneo no encontrado' },
        { status: 404 }
      );
    }

    // Build response based on payment status
    const vulnerabilities = (scan.results as Vulnerability[]) || [];

    // If not paid, hide sensitive details from vulnerabilities
    const processedVulnerabilities = scan.is_paid
      ? vulnerabilities
      : vulnerabilities.map((v) => ({
          ...v,
          // Hide full value and detailed location for unpaid scans
          fullValue: undefined,
          location: v.location ? '🔒 Desbloquear para ver' : undefined,
          lineNumber: undefined,
          remediation: {
            steps: ['🔒 Desbloquea el reporte completo para ver la solución'],
            codeExample: undefined,
          },
        }));

    // Calculate summary
    const summary = {
      critical: vulnerabilities.filter((v) => v.severity === 'critical').length,
      high: vulnerabilities.filter((v) => v.severity === 'high').length,
      medium: vulnerabilities.filter((v) => v.severity === 'medium').length,
      low: vulnerabilities.filter((v) => v.severity === 'low').length,
      total: vulnerabilities.length,
    };

    const results: ScanResults = {
      id: scan.id,
      url: scan.url,
      score: scan.score || 0,
      status: scan.status,
      vulnerabilities: processedVulnerabilities,
      summary,
      isPaid: scan.is_paid,
      scannedAt: scan.created_at,
      completedAt: scan.completed_at || undefined,
    };

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Results API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener resultados' },
      { status: 500 }
    );
  }
}
