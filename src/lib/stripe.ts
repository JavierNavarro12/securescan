import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Price in cents (€0.99 = 99 cents)
export const REPORT_PRICE = 99;
export const CURRENCY = 'eur';

// Create a checkout session for unlocking a scan report
export async function createCheckoutSession(
  scanId: string,
  scanUrl: string
): Promise<Stripe.Checkout.Session> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: 'Reporte de Seguridad Completo',
            description: `Análisis detallado de vulnerabilidades para ${scanUrl}`,
            images: [`${appUrl}/og-image.png`],
          },
          unit_amount: REPORT_PRICE,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/scan/${scanId}?success=true`,
    cancel_url: `${appUrl}/scan/${scanId}?canceled=true`,
    metadata: {
      scanId,
      scanUrl,
    },
    // Allow customer to enter email for receipt
    customer_creation: 'if_required',
    // Expire session after 30 minutes
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return session;
}

// Verify Stripe webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

// Get payment intent details
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// Format price for display
export function formatPrice(amount: number = REPORT_PRICE): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: CURRENCY.toUpperCase(),
  }).format(amount / 100);
}
