import type { APIContext } from 'astro';
import { createCasperFioriOrder, validateFioriOrderInput, type FioriOrderInput } from '../../../modules/necrologi-fiori-cordogli/payments/fiori-order';
import { onlinePaymentsAreConfigured, createCheckoutSession } from '../../../modules/necrologi-fiori-cordogli/payments/provider';

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

export async function POST(context: APIContext): Promise<Response> {
  let body: FioriOrderInput;

  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Richiesta non valida.' }, 400);
  }

  try {
    const order = await validateFioriOrderInput(body);

    if (!onlinePaymentsAreConfigured()) {
      return jsonResponse({
        success: false,
        error: 'Il pagamento online non e ancora attivo. Riprova piu tardi.',
        code: 'ONLINE_PAYMENT_NOT_CONFIGURED',
      }, 503);
    }

    const casperOrder = await createCasperFioriOrder({
      ...order.payload,
      stato_pagamento: 'in_attesa_pagamento',
    });
    const casperOrderId = String((casperOrder.data as any)?.id || (casperOrder as any).id || '');
    const origin = getOrigin(context);
    const checkout = await createCheckoutSession({
      casperOrderId,
      amount: order.importo,
      currency: 'EUR',
      description: String(order.payload.fiore_nome || 'Ordine fiori FADI'),
      stripePriceId: order.stripePriceId,
      customer: {
        name: String(order.payload.mittente || ''),
        email: String(order.payload.email || ''),
        phone: String(order.payload.telefono || ''),
      },
      metadata: {
        casper_order_id: casperOrderId,
        annuncio_id: String(order.payload.annuncio_id || ''),
        fiore_id: String(order.fioreId),
        stripe_price_id: order.stripePriceId || '',
      },
      successUrl: `${origin}/necrologi/${order.payload.annuncio_slug}/?pagamento=fiori-ok`,
      cancelUrl: `${origin}/necrologi/${order.payload.annuncio_slug}/?pagamento=fiori-annullato#invia-fiori`,
    });

    return jsonResponse({
      success: true,
      payment_required: true,
      checkout_url: checkout.checkoutUrl,
      provider: checkout.provider,
      session_id: checkout.sessionId,
      casper_order: casperOrder,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Non siamo riusciti a registrare l\'ordine.';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
