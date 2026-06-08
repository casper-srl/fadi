declare const process: {
  env?: Record<string, string | undefined>;
} | undefined;

export function getServerEnv(name: string): string {
  return typeof process !== 'undefined' ? process.env?.[name] || '' : '';
}

export function getSiteOrigin(): string {
  const siteUrl = getServerEnv('SITE_URL');
  if (siteUrl) return siteUrl.replace(/\/+$/g, '');

  const vercelUrl = getServerEnv('VERCEL_PROJECT_PRODUCTION_URL');
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/+$/g, '');

  return 'https://fadi-lake.vercel.app';
}

export function getVapidConfig() {
  const publicKey = getServerEnv('VAPID_PUBLIC_KEY');
  const privateKey = getServerEnv('VAPID_PRIVATE_KEY');
  const subject = getServerEnv('VAPID_SUBJECT') || `mailto:${getServerEnv('VAPID_CONTACT_EMAIL') || 'info@fadi.it'}`;

  return {
    publicKey,
    privateKey,
    subject,
    enabled: Boolean(publicKey && privateKey)
  };
}

export function getCronSecret(): string {
  return getServerEnv('CRON_SECRET') || getServerEnv('NOTIFICATION_CRON_SECRET');
}
