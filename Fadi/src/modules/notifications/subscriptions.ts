export interface StoredPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

import { getServerEnv } from './env';

const SUBSCRIPTIONS_SET_KEY = 'fadi:pwa:subscriptions';
const SUBSCRIPTION_KEY_PREFIX = 'fadi:pwa:subscription:';
const LAST_ANNUNCIO_ID_KEY = 'fadi:pwa:last-annuncio-id';

function getKvConfig() {
  const url = getServerEnv('KV_REST_API_URL') || getServerEnv('UPSTASH_REDIS_REST_URL');
  const token = getServerEnv('KV_REST_API_TOKEN') || getServerEnv('UPSTASH_REDIS_REST_TOKEN');
  return { url, token, enabled: Boolean(url && token) };
}

export function subscriptionStoreIsConfigured(): boolean {
  return getKvConfig().enabled;
}

async function kvCommand<T>(command: unknown[]): Promise<T> {
  const { url, token, enabled } = getKvConfig();
  if (!enabled) throw new Error('Storage notifiche non configurato.');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) {
    throw new Error(String(json.error || 'Errore storage notifiche.'));
  }

  return json.result as T;
}

async function subscriptionId(endpoint: string): Promise<string> {
  const data = new TextEncoder().encode(endpoint);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function saveSubscription(subscription: StoredPushSubscription): Promise<void> {
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error('Sottoscrizione push non valida.');
  }

  const id = await subscriptionId(subscription.endpoint);
  await kvCommand(['SET', `${SUBSCRIPTION_KEY_PREFIX}${id}`, JSON.stringify(subscription)]);
  await kvCommand(['SADD', SUBSCRIPTIONS_SET_KEY, id]);
}

export async function removeSubscription(endpoint: string): Promise<void> {
  if (!endpoint) return;

  const id = await subscriptionId(endpoint);
  await kvCommand(['DEL', `${SUBSCRIPTION_KEY_PREFIX}${id}`]);
  await kvCommand(['SREM', SUBSCRIPTIONS_SET_KEY, id]);
}

export async function listSubscriptions(): Promise<StoredPushSubscription[]> {
  const ids = await kvCommand<string[]>(['SMEMBERS', SUBSCRIPTIONS_SET_KEY]);
  const items = await Promise.all((ids || []).map(async (id) => {
    const raw = await kvCommand<string | null>(['GET', `${SUBSCRIPTION_KEY_PREFIX}${id}`]);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredPushSubscription;
    } catch {
      return null;
    }
  }));

  return items.filter(Boolean) as StoredPushSubscription[];
}

export async function getLastAnnuncioId(): Promise<number | null> {
  const raw = await kvCommand<string | null>(['GET', LAST_ANNUNCIO_ID_KEY]);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export async function setLastAnnuncioId(id: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) return;
  await kvCommand(['SET', LAST_ANNUNCIO_ID_KEY, String(id)]);
}
