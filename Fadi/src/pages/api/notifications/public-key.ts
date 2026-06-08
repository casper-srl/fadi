import type { APIContext } from 'astro';
import { getVapidConfig } from '../../../modules/notifications/env';

export const prerender = false;

export function GET(_context: APIContext): Response {
  const config = getVapidConfig();

  return new Response(JSON.stringify({
    enabled: config.enabled,
    publicKey: config.enabled ? config.publicKey : ''
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
