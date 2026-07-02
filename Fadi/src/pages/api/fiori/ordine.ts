import type { APIContext } from 'astro';
import { createCasperFioriOrder, validateFioriOrderInput, type FioriOrderInput } from '../../../modules/necrologi-fiori-cordogli/payments/fiori-order';

export const prerender = false;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function getOrigin(context: APIContext): string {
  return context.url.origin;
}

function findPaymentUrl(source: unknown): string {
  if (!source || typeof source !== 'object') return '';

  const record = source as Record<string, unknown>;
  const directKeys = [
    'checkout_url',
    'payment_url',
    'paymentUrl',
    'link_pagamento',
    'url_pagamento',
    'pagamento_url',
    'pagamentoUrl',
    'redirect_url',
    'redirectUrl',
    'stripe_checkout_url',
    'stripeCheckoutUrl',
  ];

  for (const key of directKeys) {
    const value = record[key];
    if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value;
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const nested = findPaymentUrl(item);
        if (nested) return nested;
      }
    } else if (value && typeof value === 'object') {
      const nested = findPaymentUrl(value);
      if (nested) return nested;
    }
  }

  return '';
}

export async function POST(context: APIContext): Promise<Response> {
  let body: FioriOrderInput;

  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Richiesta non valida.' }, 400);
  }

  try {
    const order = await validateFioriOrderInput(body);
    const origin = getOrigin(context);
    const successUrl = `${origin}/necrologi/${order.payload.annuncio_slug}/?pagamento=fiori-ok`;
    const cancelUrl = `${origin}/necrologi/${order.payload.annuncio_slug}/?pagamento=fiori-annullato#invia-fiori`;

    const casperOrder = await createCasperFioriOrder({
      ...order.payload,
      stato_pagamento: 'in_attesa_pagamento',
      success_url: successUrl,
      cancel_url: cancelUrl,
      url_success: successUrl,
      url_cancel: cancelUrl,
      redirect_success_url: successUrl,
      redirect_cancel_url: cancelUrl,
    });
    const checkoutUrl = findPaymentUrl(casperOrder);

    if (!checkoutUrl) {
      return jsonResponse({
        success: false,
        error: 'Ordine registrato, ma Cas-Per non ha restituito il link per completare il pagamento.',
        code: 'CASPER_PAYMENT_URL_MISSING',
        casper_order: casperOrder,
      }, 502);
    }

    return jsonResponse({
      success: true,
      payment_required: true,
      checkout_url: checkoutUrl,
      provider: 'casper',
      casper_order: casperOrder,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Non siamo riusciti a registrare l\'ordine.';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
