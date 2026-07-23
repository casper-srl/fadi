import webpush from 'web-push';
import type { AnnuncioData } from '../necrologi-fiori-cordogli/types';
import { getSiteOrigin, getVapidConfig } from './env';
import { removeSubscription, type StoredPushSubscription } from './subscriptions';

export interface NewAnnuncioNotificationItem {
  id: number | string;
  slug: string;
  nominativo: string;
  paese?: string;
  foto_url?: string;
  url?: string;
  data?: string;
}

function configureWebPush() {
  const config = getVapidConfig();
  if (!config.enabled) {
    throw new Error('Chiavi VAPID non configurate.');
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
}

function formatDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.split('T')[0] || '';
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function normalizeAnnuncioData(item: AnnuncioData): NewAnnuncioNotificationItem {
  return {
    id: item.id,
    slug: item.slug,
    nominativo: item.nominativo,
    paese: item.annuncio?.paese,
    foto_url: item.defunto?.foto_url,
  };
}

function notificationPayload(item: NewAnnuncioNotificationItem) {
  const details = [item.paese, formatDate(item.data)].filter(Boolean).join(' - ');
  const body = details
    ? `${details}. Tocca per aprire il necrologio.`
    : 'E stato pubblicato un nuovo annuncio funebre. Tocca per aprire il necrologio.';
  const url = item.url || new URL(`/necrologi/${item.slug}/`, getSiteOrigin()).toString();

  return JSON.stringify({
    title: `Nuovo necrologio: ${item.nominativo}`,
    body,
    url,
    image: item.foto_url || '',
    icon: item.foto_url || '',
    tag: `necrologio-${item.id}`
  });
}

export async function sendNewAnnuncioNotification(
  subscriptions: StoredPushSubscription[],
  item: AnnuncioData
): Promise<{ sent: number; failed: number }> {
  return sendAnnuncioNotification(subscriptions, normalizeAnnuncioData(item));
}

export async function sendAnnuncioNotification(
  subscriptions: StoredPushSubscription[],
  item: NewAnnuncioNotificationItem
): Promise<{ sent: number; failed: number }> {
  configureWebPush();

  let sent = 0;
  let failed = 0;
  const payload = notificationPayload(item);

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, payload);
      sent += 1;
    } catch (error: any) {
      failed += 1;
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await removeSubscription(subscription.endpoint).catch(() => undefined);
      }
    }
  }));

  return { sent, failed };
}
