import type { APIContext } from 'astro';
import { saveSubscription, subscriptionStoreIsConfigured } from '../../../modules/notifications/subscriptions';

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
    const subscription = await context.request.json();
    await saveSubscription(subscription);
    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sottoscrizione non valida.';
    return jsonResponse({ success: false, error: message }, 400);
  }
}
