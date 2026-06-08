import webpush from 'web-push';
import type { AnnuncioData } from '../necrologi-fiori-cordogli/types';
import { getSiteOrigin, getVapidConfig } from './env';
import { removeSubscription, type StoredPushSubscription } from './subscriptions';

function configureWebPush() {
  const config = getVapidConfig();
  if (!config.enabled) {
    throw new Error('Chiavi VAPID non configurate.');
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
}

function notificationPayload(item: AnnuncioData) {
  const comune = item.annuncio?.paese ? ` - ${item.annuncio.paese}` : '';
  const url = new URL(`/necrologi/${item.slug}/`, getSiteOrigin()).toString();

  return JSON.stringify({
    title: `Nuovo necrologio: ${item.nominativo}`,
    body: `E stato pubblicato un nuovo annuncio funebre${comune}.`,
    url,
    tag: `necrologio-${item.id}`
  });
}

export async function sendNewAnnuncioNotification(
  subscriptions: StoredPushSubscription[],
  item: AnnuncioData
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
