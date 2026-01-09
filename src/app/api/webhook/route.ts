import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, REPORT_PRICE } from '@/lib/stripe';
import { db } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get scan ID from metadata
        const scanId = session.metadata?.scanId;

        if (!scanId) {
          console.error('No scanId in session metadata');
          break;
        }

        // Mark scan as paid
        const success = await db.markScanAsPaid(scanId, session.id);

        if (success) {
          // Create payment record
          await db.createPayment(
            scanId,
            session.payment_intent as string,
            REPORT_PRICE,
            'completed'
          );
          console.log(`Scan ${scanId} marked as paid`);
        } else {
          console.error(`Failed to mark scan ${scanId} as paid`);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const scanId = session.metadata?.scanId;

        if (scanId) {
          // Log expired checkout (no action needed)
          console.log(`Checkout session expired for scan ${scanId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing (we need raw body for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};
