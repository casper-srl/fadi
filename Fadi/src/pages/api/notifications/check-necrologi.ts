import type { APIContext } from 'astro';
import { CasperClient } from '../../../modules/necrologi-fiori-cordogli/api/casper-client';
import { getCasperApiKey } from '../../../modules/necrologi-fiori-cordogli/config';
import type { AnnuncioData } from '../../../modules/necrologi-fiori-cordogli/types';
import { getCronSecret, getVapidConfig } from '../../../modules/notifications/env';
import {
  getLastAnnuncioId,
  listSubscriptions,
  setLastAnnuncioId,
  subscriptionStoreIsConfigured
} from '../../../modules/notifications/subscriptions';
import { sendNewAnnuncioNotification } from '../../../modules/notifications/push';

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
  const secret = getCronSecret();
  if (!secret) return true;

  const auth = context.request.headers.get('Authorization') || '';
  return auth === `Bearer ${secret}` || context.url.searchParams.get('secret') === secret;
}

function sortByNewestId(items: AnnuncioData[]): AnnuncioData[] {
  return [...items].sort((left, right) => Number(right.id) - Number(left.id));
}

export async function GET(context: APIContext): Promise<Response> {
  if (!isAuthorized(context)) {
    return jsonResponse({ success: false, error: 'Non autorizzato.' }, 401);
  }

  if (!subscriptionStoreIsConfigured()) {
    return jsonResponse({ success: false, error: 'Storage notifiche non configurato.' }, 503);
  }

  if (!getVapidConfig().enabled) {
    return jsonResponse({ success: false, error: 'Chiavi VAPID non configurate.' }, 503);
  }

  const client = new CasperClient(getCasperApiKey());
  const annunci = sortByNewestId(await client.getAnnunci(30));
  const newestId = annunci[0]?.id || 0;

  if (!newestId) {
    return jsonResponse({ success: true, checked: 0, notified: 0 });
  }

  const lastKnownId = await getLastAnnuncioId();
  if (!lastKnownId) {
    await setLastAnnuncioId(newestId);
    return jsonResponse({ success: true, baseline: newestId, notified: 0 });
  }

  const newItems = annunci
    .filter((item) => Number(item.id) > lastKnownId)
    .sort((left, right) => Number(left.id) - Number(right.id));

  if (newItems.length === 0) {
    await setLastAnnuncioId(Math.max(lastKnownId, newestId));
    return jsonResponse({ success: true, checked: annunci.length, notified: 0 });
  }

  const subscriptions = await listSubscriptions();
  let sent = 0;
  let failed = 0;

  for (const item of newItems) {
    const result = await sendNewAnnuncioNotification(subscriptions, item);
    sent += result.sent;
    failed += result.failed;
  }

  await setLastAnnuncioId(newestId);

  return jsonResponse({
    success: true,
    checked: annunci.length,
    newAnnouncements: newItems.length,
    subscriptions: subscriptions.length,
    sent,
    failed
  });
}

export const POST = GET;
