import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/supabase';

const verifyRequestSchema = z.object({
  scanId: z.string().uuid('ID de escaneo inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'ID de escaneo inválido' },
        { status: 400 }
      );
    }

    const { scanId } = validation.data;

    // Check if already paid
    const scan = await db.getScan(scanId);
    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Escaneo no encontrado' },
        { status: 404 }
      );
    }

    if (scan.is_paid) {
      return NextResponse.json({ success: true, isPaid: true });
    }

    // Search for completed checkout sessions with this scanId
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    // Find a completed session for this scan
    const paidSession = sessions.data.find(
      (session) =>
        session.metadata?.scanId === scanId &&
        session.payment_status === 'paid'
    );

    if (paidSession) {
      // Mark scan as paid in database
      await db.markScanAsPaid(scanId, paidSession.id);

      return NextResponse.json({ success: true, isPaid: true });
    }

    return NextResponse.json({ success: true, isPaid: false });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar pago' },
      { status: 500 }
    );
  }
}
