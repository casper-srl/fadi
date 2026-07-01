import { createHmac, timingSafeEqual } from 'node:crypto';
import { getPaymentRuntimeConfig } from './config';

export interface CheckoutSessionRequest {
  casperOrderId?: string;
  amount: number;
  currency: 'EUR';
  description: string;
  stripePriceId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  provider: string;
  checkoutUrl: string;
  sessionId: string;
}

export interface PaymentWebhookUpdate {
  casperOrderId: string;
  status: 'paid' | 'failed' | 'cancelled' | 'refunded' | 'pending';
  provider: string;
  providerPaymentId?: string;
  providerSessionId?: string;
  amount?: number;
  paidAt?: string;
  rawEventId?: string;
}

export function onlinePaymentsAreConfigured(): boolean {
  const config = getPaymentRuntimeConfig();
  if (!config.onlineEnabled || !config.provider) return false;
  if (config.provider === 'stripe') return Boolean(config.stripeSecretKey);
  return true;
}

function appendMetadata(params: URLSearchParams, metadata: Record<string, string>) {
  for (const [key, value] of Object.entries(metadata)) {
    params.append(`metadata[${key}]`, value);
    params.append(`payment_intent_data[metadata][${key}]`, value);
  }
}

async function createStripeCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  const config = getPaymentRuntimeConfig();
  if (!config.stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY non configurata.');
  }

  const amountInCents = Math.round(request.amount * 100);
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', request.successUrl);
  params.append('cancel_url', request.cancelUrl);
  params.append('customer_email', request.customer.email);
  params.append('client_reference_id', request.casperOrderId || request.metadata.casper_order_id || '');
  params.append('line_items[0][quantity]', '1');
  if (request.stripePriceId) {
    params.append('line_items[0][price]', request.stripePriceId);
  } else {
    params.append('line_items[0][price_data][currency]', request.currency.toLowerCase());
    params.append('line_items[0][price_data][unit_amount]', String(amountInCents));
    params.append('line_items[0][price_data][product_data][name]', request.description);
  }
  params.append('payment_intent_data[description]', request.description);
  appendMetadata(params, request.metadata);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json?.url || !json?.id) {
    const message = json?.error?.message || 'Impossibile creare la sessione di pagamento Stripe.';
    throw new Error(message);
  }

  return {
    provider: 'stripe',
    checkoutUrl: json.url,
    sessionId: json.id,
  };
}

export async function createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  const config = getPaymentRuntimeConfig();
  if (!onlinePaymentsAreConfigured()) {
    throw new Error('Il pagamento online non e ancora configurato.');
  }

  if (config.provider === 'stripe') {
    return createStripeCheckoutSession(request);
  }

  throw new Error(`Provider pagamento "${config.provider}" non implementato in questa installazione.`);
}

export function verifyGenericWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getPaymentRuntimeConfig();
  if (!webhookSecret || !signature) return false;

  const digest = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const expected = Buffer.from(digest, 'utf8');
  const received = Buffer.from(signature, 'utf8');

  return expected.length === received.length && timingSafeEqual(expected, received);
}

function parseStripeSignature(signature: string): { timestamp: string; signatures: string[] } {
  const parts = signature.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2) || '';
  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3));
  return { timestamp, signatures };
}

function secureCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyStripeWebhookSignature(rawBody: string, signature: string): boolean {
  const { stripeWebhookSecret, webhookSecret } = getPaymentRuntimeConfig();
  const secret = stripeWebhookSecret || webhookSecret;
  if (!secret || !signature) return false;

  const { timestamp, signatures } = parseStripeSignature(signature);
  const timestampSeconds = Number(timestamp);
  if (!timestamp || !Number.isFinite(timestampSeconds) || signatures.length === 0) return false;

  const toleranceSeconds = 300;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
  return signatures.some((candidate) => secureCompare(candidate, expected));
}

function stripeStatusFromEvent(type: string, session: any): PaymentWebhookUpdate['status'] {
  if (type === 'checkout.session.completed') {
    return session?.payment_status === 'paid' ? 'paid' : 'pending';
  }
  if (type === 'checkout.session.async_payment_succeeded') return 'paid';
  if (type === 'checkout.session.async_payment_failed') return 'failed';
  if (type === 'checkout.session.expired') return 'cancelled';
  return 'pending';
}

function parseStripeWebhookEvent(rawBody: string, signature: string): PaymentWebhookUpdate {
  if (!verifyStripeWebhookSignature(rawBody, signature)) {
    throw new Error('Firma webhook Stripe non valida.');
  }

  const event = JSON.parse(rawBody);
  const session = event?.data?.object || {};
  const metadata = session?.metadata || {};
  const casperOrderId = String(metadata.casper_order_id || session.client_reference_id || '');

  if (!casperOrderId) {
    throw new Error('Ordine Cas-Per mancante nel webhook Stripe.');
  }

  return {
    casperOrderId,
    status: stripeStatusFromEvent(event?.type || '', session),
    provider: 'stripe',
    providerPaymentId: session.payment_intent,
    providerSessionId: session.id,
    amount: typeof session.amount_total === 'number' ? session.amount_total / 100 : undefined,
    paidAt: event?.created ? new Date(event.created * 1000).toISOString() : undefined,
    rawEventId: event?.id,
  };
}

function parseGenericWebhookEvent(rawBody: string, signature: string): PaymentWebhookUpdate {
  if (!verifyGenericWebhookSignature(rawBody, signature)) {
    throw new Error('Firma webhook non valida.');
  }

  const event = JSON.parse(rawBody);
  const casperOrderId = String(event?.metadata?.casper_order_id || event?.casper_order_id || '');
  if (!casperOrderId) {
    throw new Error('Ordine Cas-Per mancante.');
  }

  return {
    casperOrderId,
    status: event?.status || 'pending',
    provider: event?.provider || 'generic',
    providerPaymentId: event?.payment_id,
    providerSessionId: event?.session_id,
    amount: event?.amount,
    paidAt: event?.paid_at,
    rawEventId: event?.id,
  };
}

export function parsePaymentWebhookEvent(rawBody: string, headers: Headers): PaymentWebhookUpdate {
  const provider = getPaymentRuntimeConfig().provider;

  if (provider === 'stripe') {
    return parseStripeWebhookEvent(rawBody, headers.get('stripe-signature') || '');
  }

  return parseGenericWebhookEvent(rawBody, headers.get('x-fadi-payment-signature') || '');
}
