# Modulo necrologi, fiori e cordogli

Modulo Astro copiabile per integrare CasPer in un sito di onoranze funebri.

## Cosa contiene

- `api/casper-client.ts`: client per gli annunci CasPer.
- `config.ts`: lettura server-side di `CASPER_API_KEY`.
- `types/`: tipi TypeScript per annunci, defunti, cerimonie e messaggi.
- `utils/formatters.ts`: formattazione date/orari e URL foto con cache-buster.
- `components/CasperNecrologiList.astro`: lista annunci con ricerca, filtri e paginazione.
- `components/CasperAnnuncioCard.astro`: card annuncio.
- `components/CasperMemorialPage.astro`: wrapper pagina dettaglio con messaggi, foto, cordogli e fiori.
- `components/CasperMemorialDetails.astro`: dettaglio manifesto/cerimonie.
- `components/CasperMessagesList.astro`: area messaggi e foto ricevuti.
- `components/CasperCondolenceForms.astro`: form cordoglio, foto-cordoglio e ordine fiori.
- `payments/`: validazione server-side ordine fiori prima dell'invio a CasPer.
- `pages/api/fiori/ordine.ts`: endpoint server Astro per creare l'ordine fiori senza esporre la chiave CasPer nel browser.
- `pages/api/pagamenti/webhook.ts`: endpoint webhook legacy, non necessario se pagamenti e notifiche sono gestiti dal nuovo AF/CasPer.

## Come riusarlo

1. Copia `src/modules/necrologi-fiori-cordogli/` nel nuovo progetto Astro.
2. Definisci le variabili ambiente:

```env
CASPER_API_KEY=...
```

Se riusi anche la PWA con notifiche nuovi necrologi, copia le rotte `/api/notifications/*`, `public/sw.js`, `public/manifest.webmanifest`, `public/pwa-client.js`, `public/offline.html`, le icone PWA e configura `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`.

Per mostrare il pagamento online nel form fiori:

```env
PUBLIC_FIORI_ONLINE_PAYMENTS_ENABLED=true
```

Stripe non viene gestito da questo sito. I dati Stripe, la modalita test/live, la creazione del pagamento e le notifiche restano sul nuovo AF/CasPer. FADI invia l'ordine fiori a CasPer e reindirizza l'utente al link di pagamento restituito dall'API.

3. Crea le rotte `/necrologi/` e `/necrologi/[slug]/` importando client e componenti dal modulo.

Pagina lista:

```astro
---
import { CasperClient } from '../../modules/necrologi-fiori-cordogli/api/casper-client';
import { getCasperApiKey } from '../../modules/necrologi-fiori-cordogli/config';
import CasperNecrologiList from '../../modules/necrologi-fiori-cordogli/components/CasperNecrologiList.astro';

export const prerender = false;

const client = new CasperClient(getCasperApiKey());
const annunci = await client.getAnnunci(200);
---

<CasperNecrologiList annunci={annunci} />
```

Pagina dettaglio:

```astro
---
import { CasperClient } from '../../modules/necrologi-fiori-cordogli/api/casper-client';
import { getCasperApiKey } from '../../modules/necrologi-fiori-cordogli/config';
import CasperMemorialPage from '../../modules/necrologi-fiori-cordogli/components/CasperMemorialPage.astro';

export const prerender = false;

const slug = Astro.params.slug;
const apiKey = getCasperApiKey();
const client = new CasperClient(apiKey);
const item = slug ? await client.getAnnuncioBySlug(slug) : null;

if (!item || !slug) return Astro.redirect('/404');
---

<CasperMemorialPage item={item} slug={slug} />
```

## Nota sicurezza

Le chiamate SSR e i POST dei form usano `CASPER_API_KEY` solo lato server. Cordogli, foto-cordogli, verifica OTP e refresh dei messaggi passano da `/api/casper/*`, una rotta server con allowlist stretta dei soli endpoint CasPer necessari. L'ordine fiori passa da `/api/fiori/ordine`, dove `fiore_id` e `importo` vengono ricalcolati sul server prima dell'invio a CasPer.
