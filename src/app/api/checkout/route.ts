import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/stripe';
import { db } from '@/lib/supabase';

// Request validation schema
const checkoutRequestSchema = z.object({
  scanId: z.string().uuid('ID de escaneo inválido'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = checkoutRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'ID de escaneo inválido' },
        { status: 400 }
      );
    }

    const { scanId } = validation.data;

    // Get scan from database
    const scan = await db.getScan(scanId);

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Escaneo no encontrado' },
        { status: 404 }
      );
    }

    // Check if already paid
    if (scan.is_paid) {
      return NextResponse.json(
        { success: false, error: 'Este reporte ya ha sido desbloqueado' },
        { status: 400 }
      );
    }

    // Check if scan is completed
    if (scan.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'El escaneo aún no ha finalizado' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(scanId, scan.url);

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
