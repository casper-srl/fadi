# FADI

Sito Astro definitivo per Onoranze Funebri FADI.

## Struttura

```text
Fadi/
├── public/                         # asset statici pubblici
├── src/
│   ├── components/                 # componenti del sito FADI
│   ├── layouts/                    # layout condivisi
│   ├── modules/
│   │   └── necrologi-fiori-cordogli/
│   │       ├── api/                # client CasPer
│   │       ├── components/         # lista, dettaglio, cordogli, fiori
│   │       ├── types/              # tipi TypeScript del modulo
│   │       ├── utils/              # formattatori e helper immagini
│   │       └── config.ts           # lettura variabili ambiente CasPer
│   └── pages/                      # rotte Astro
├── tools/casper-research/          # script di analisi usati durante il test
├── .env.example                    # template variabili ambiente
├── astro.config.mjs
├── package.json
└── vercel.json
```

Il modulo `src/modules/necrologi-fiori-cordogli/` è la parte copiabile per il prossimo sito: contiene integrazione CasPer, necrologi, cordogli, foto-cordogli e form fiori.

## Setup

Richiede Node.js `>=22.12.0`.

```sh
cd Fadi
npm install
cp .env.example .env
npm run dev
```

Imposta le variabili:

```env
CASPER_API_KEY=...
```

`CASPER_API_KEY` deve restare solo lato server: le pagine e i form usano endpoint Astro interni, cosi' la chiave non finisce nel browser.

Per la PWA e le notifiche nuovi necrologi servono anche:

```env
SITE_URL=https://fadi-lake.vercel.app
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:info@fadi.it
CRON_SECRET=...
NOTIFICATIONS_WEBHOOK_SECRET=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Le chiavi VAPID si generano con:

```sh
npx web-push generate-vapid-keys
```

Webhook nuovo AF per notificare subito la pubblicazione di un necrologio:

```http
POST https://fadi.annuncifunebri.it/api/notifications/annuncio-pubblicato
Authorization: Bearer ${NOTIFICATIONS_WEBHOOK_SECRET}
Content-Type: application/json
```

```json
{
  "event": "annuncio.pubblicato",
  "id": 142900,
  "slug": "mario-rossi",
  "nominativo": "Mario Rossi",
  "paese": "Dasa",
  "foto_url": "https://...",
  "published_at": "2026-07-02"
}
```

## Build

```sh
npm run build
npm run preview
```
