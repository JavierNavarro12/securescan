import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not configured');

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const REPORT_PRICE = 99;
export const CURRENCY = 'eur';

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
  });

  return session;
}

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

export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export function formatPrice(amount: number = REPORT_PRICE): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: CURRENCY.toUpperCase(),
  }).format(amount / 100);
}
