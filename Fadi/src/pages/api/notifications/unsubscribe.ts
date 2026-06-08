import type { APIContext } from 'astro';
import { removeSubscription, subscriptionStoreIsConfigured } from '../../../modules/notifications/subscriptions';

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

export async function POST(context: APIContext): Promise<Response> {
  if (!subscriptionStoreIsConfigured()) {
    return jsonResponse({ success: false, error: 'Storage notifiche non configurato.' }, 503);
  }

  try {
    const body = await context.request.json();
    await removeSubscription(String(body.endpoint || ''));
    return jsonResponse({ success: true });
  } catch {
    return jsonResponse({ success: false, error: 'Richiesta non valida.' }, 400);
  }
}
