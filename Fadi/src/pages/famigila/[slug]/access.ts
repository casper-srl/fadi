import type { APIContext } from 'astro';

export const prerender = false;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function autoSubmitPage(destination: string, pin: string): Response {
  const safeDestination = escapeHtml(destination);
  const safePin = escapeHtml(pin);

  return new Response(`<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Accesso area famiglia</title>
  </head>
  <body>
    <form id="family-access-form" method="post" action="${safeDestination}">
      <input type="hidden" name="pin" value="${safePin}">
      <noscript>
        <p>Per continuare l'accesso all'area famiglia premi il pulsante.</p>
        <button type="submit">Accedi</button>
      </noscript>
    </form>
    <script>document.getElementById('family-access-form').submit();</script>
  </body>
</html>`, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function redirectTo(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': location,
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(context: APIContext): Promise<Response> {
  const slug = String(context.params.slug || '').trim();
  if (!slug) return redirectTo('/area-famiglia/');

  const formData = await context.request.formData();
  const pin = String(formData.get('pin') || '').trim();
  if (!pin) return redirectTo(`/famigila/${encodeURIComponent(slug)}/`);

  const destination = `https://admin.annuncifunebri.it/famiglia/${encodeURIComponent(slug)}/access`;
  return autoSubmitPage(destination, pin);
}

export function GET(context: APIContext): Response {
  const slug = String(context.params.slug || '').trim();
  return redirectTo(slug ? `/famigila/${encodeURIComponent(slug)}/` : '/area-famiglia/');
}
