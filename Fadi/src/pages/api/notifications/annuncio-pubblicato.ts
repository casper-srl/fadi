import type { APIContext } from 'astro';
import { getNotificationsWebhookSecret, getVapidConfig } from '../../../modules/notifications/env';
import { sendAnnuncioNotification, type NewAnnuncioNotificationItem } from '../../../modules/notifications/push';
import { listSubscriptions, subscriptionStoreIsConfigured } from '../../../modules/notifications/subscriptions';

export const prerender = false;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

function isAuthorized(context: APIContext): boolean {
  const secret = getNotificationsWebhookSecret();
  if (!secret) return false;

  const auth = context.request.headers.get('Authorization') || '';
  const headerSecret = context.request.headers.get('X-Webhook-Secret') || '';
  return auth === `Bearer ${secret}`
    || headerSecret === secret
    || context.url.searchParams.get('secret') === secret;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asId(value: unknown): number | string {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  return asString(value);
}

function normalizePayload(body: Record<string, unknown>): NewAnnuncioNotificationItem {
  const id = asId(body.id ?? body.annuncio_id);
  const slug = asString(body.slug);
  const nominativo = asString(body.nominativo ?? body.nome);
  const paese = asString(body.paese ?? body.comune);
  const foto_url = asString(body.foto_url ?? body.foto ?? body.image_url);
  const url = asString(body.url ?? body.page_url ?? body.pagina_url);
  const published_at = asString(body.published_at ?? body.data_pubblicazione ?? body.data);

  if (!id || !slug || !nominativo) {
    throw new Error('Payload annuncio non valido: id, slug e nominativo sono obbligatori.');
  }

  return {
    id,
    slug,
    nominativo,
    paese: paese || undefined,
    foto_url: foto_url || undefined,
    url: url || undefined,
    published_at: published_at || undefined,
  };
}

export async function POST(context: APIContext): Promise<Response> {
  if (!isAuthorized(context)) {
    return jsonResponse({ success: false, error: 'Non autorizzato.' }, 401);
  }

  if (!subscriptionStoreIsConfigured()) {
    return jsonResponse({ success: false, error: 'Storage notifiche non configurato.' }, 503);
  }

  if (!getVapidConfig().enabled) {
    return jsonResponse({ success: false, error: 'Chiavi VAPID non configurate.' }, 503);
  }

  try {
    const body = await context.request.json();
    if (!body || typeof body !== 'object') {
      return jsonResponse({ success: false, error: 'Payload non valido.' }, 400);
    }

    const event = asString((body as Record<string, unknown>).event);
    if (event && event !== 'annuncio.pubblicato') {
      return jsonResponse({ success: false, error: `Evento "${event}" non gestito.` }, 400);
    }

    const item = normalizePayload(body as Record<string, unknown>);
    const subscriptions = await listSubscriptions();
    const result = subscriptions.length > 0
      ? await sendAnnuncioNotification(subscriptions, item)
      : { sent: 0, failed: 0 };

    return jsonResponse({
      success: true,
      event: event || 'annuncio.pubblicato',
      annuncio_id: item.id,
      subscriptions: subscriptions.length,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook notifiche non valido.';
    return jsonResponse({ success: false, error: message }, 400);
  }
}

