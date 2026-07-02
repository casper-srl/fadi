export type FioriPaymentMethod = 'online';

export interface PaymentRuntimeConfig {
  onlineEnabled: boolean;
  provider: string;
  webhookSecret: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  casperPaymentStatusEndpoint: string;
}

function readEnv(name: string): string {
  const runtimeEnv = (globalThis as any).process?.env?.[name];
  return runtimeEnv || import.meta.env[name] || '';
}

export function getPaymentRuntimeConfig(): PaymentRuntimeConfig {
  return {
    onlineEnabled: readEnv('FIORI_ONLINE_PAYMENTS_ENABLED') === 'true',
    provider: readEnv('FIORI_PAYMENT_PROVIDER'),
    webhookSecret: readEnv('FIORI_PAYMENT_WEBHOOK_SECRET'),
    stripeSecretKey: readEnv('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: readEnv('STRIPE_WEBHOOK_SECRET'),
    casperPaymentStatusEndpoint: readEnv('CASPER_PAYMENT_STATUS_ENDPOINT'),
  };
}

export function isPublicOnlinePaymentEnabled(): boolean {
  return readEnv('PUBLIC_FIORI_ONLINE_PAYMENTS_ENABLED') !== 'false';
}
