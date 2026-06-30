import { getCasperApiKey } from '../config';
import { CasperClient } from '../api/casper-client';
import type { AnnuncioData, FioreData } from '../types';
import type { FioriPaymentMethod } from './config';

export interface FioriOrderInput {
  fiore_id: unknown;
  importo: unknown;
  fiore_nome?: unknown;
  slug?: unknown;
  annuncio_id?: unknown;
  nominativo?: unknown;
  mittente?: unknown;
  nome?: unknown;
  telefono?: unknown;
  email?: unknown;
  mail?: unknown;
  defunto?: unknown;
  nastro?: unknown;
  note?: unknown;
  privacy?: unknown;
  accetta_privacy?: unknown;
  metodo_pagamento?: unknown;
}

export interface ValidatedFioriOrder {
  fiore: FioreData;
  annuncio: AnnuncioData | null;
  fioreId: number;
  importo: number;
  metodoPagamento: FioriPaymentMethod;
  payload: Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === '1' || value === 1;
}

function asNumber(value: unknown): number {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function getFioreAmount(fiore: FioreData): number {
  return asNumber(fiore.importo ?? fiore.prezzo_ivato ?? fiore.prezzo ?? fiore.price ?? fiore.amount);
}

function getFioreName(fiore: FioreData): string {
  return fiore.nome || fiore.denominazione || fiore.titolo || fiore.name || `Composizione ${fiore.id}`;
}

function amountsMatch(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.01;
}

export function formatEndpointError(detail: unknown): string {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(formatEndpointError).filter(Boolean).join(' ');
  if (typeof detail === 'object') {
    const source = detail as Record<string, unknown>;
    const field = source.path || source.param || source.field || source.property || '';
    const message = source.msg || source.message || source.error || source.detail || '';
    if (field && message) return `${field}: ${message}`;
    if (message) return String(message);
    return Object.entries(source)
      .map(([key, value]) => `${key}: ${formatEndpointError(value)}`)
      .filter(Boolean)
      .join(' ');
  }
  return String(detail);
}

export async function validateFioriOrderInput(input: FioriOrderInput): Promise<ValidatedFioriOrder> {
  const apiKey = getCasperApiKey();
  const client = new CasperClient(apiKey);

  const fioreId = asNumber(input.fiore_id);
  const importo = asNumber(input.importo);
  const slug = asString(input.slug);
  const annuncioId = asNumber(input.annuncio_id);
  const mittente = asString(input.mittente || input.nominativo || input.nome);
  const telefono = asString(input.telefono);
  const email = asString(input.email || input.mail);
  const defunto = asString(input.defunto);
  const nastro = asString(input.nastro);
  const note = asString(input.note);
  const privacy = asBoolean(input.privacy || input.accetta_privacy);
  const requestedMethod = asString(input.metodo_pagamento) || 'online';
  if (requestedMethod !== 'online') {
    throw new Error('Il pagamento online sicuro e l\'unico metodo disponibile.');
  }
  const metodoPagamento: FioriPaymentMethod = 'online';

  if (!Number.isInteger(fioreId) || fioreId <= 0) {
    throw new Error('fiore_id non valido.');
  }

  if (!Number.isFinite(importo) || importo <= 0) {
    throw new Error('importo non valido.');
  }

  if (!Number.isInteger(annuncioId) || annuncioId <= 0 || !slug) {
    throw new Error('Annuncio non valido.');
  }

  if (!mittente || !telefono || !email) {
    throw new Error('Nome, telefono ed email sono obbligatori.');
  }

  if (!privacy) {
    throw new Error('Devi accettare il trattamento dei dati personali.');
  }

  const [fiori, annuncio] = await Promise.all([
    client.getFiori(),
    client.getAnnuncioBySlug(slug)
  ]);

  if (!annuncio || annuncio.id !== annuncioId) {
    throw new Error('Annuncio non trovato o non coerente.');
  }

  const fiore = fiori.find((item) => Number(item.id) === fioreId);
  if (!fiore) {
    throw new Error('La composizione selezionata non e disponibile.');
  }

  const importoCasper = getFioreAmount(fiore);
  if (!Number.isFinite(importoCasper) || importoCasper <= 0 || !amountsMatch(importo, importoCasper)) {
    throw new Error('Importo della composizione non valido.');
  }

  const fioreNome = asString(input.fiore_nome) || getFioreName(fiore);
  const paymentLabel = 'online';

  return {
    fiore,
    annuncio,
    fioreId,
    importo: importoCasper,
    metodoPagamento,
    payload: {
      fiore_id: fioreId,
      id_fiore: fioreId,
      prodotto_id: fioreId,
      fiore_nome: fioreNome,
      prodotto: fioreNome,
      importo: importoCasper,
      prezzo: importoCasper,
      prezzo_label: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(importoCasper),
      quantita: 1,
      slug,
      annuncio_id: annuncioId,
      id_annuncio: annuncioId,
      annuncio_slug: slug,
      nominativo: mittente,
      nome: mittente,
      mittente,
      mittente_nome: mittente,
      telefono,
      mittente_telefono: telefono,
      email,
      mail: email,
      mittente_email: email,
      defunto,
      nome_defunto: annuncio.defunto?.nome || '',
      cognome_defunto: annuncio.defunto?.cognome || '',
      nastro,
      testo_nastro: nastro,
      messaggio_nastro: nastro,
      biglietto: nastro,
      note,
      messaggio: note,
      luogo_consegna: 'Presso il luogo delle esequie',
      metodo_pagamento: paymentLabel,
      pagamento: paymentLabel,
      stato_pagamento: 'in_attesa_pagamento',
      privacy: true,
      accetta_privacy: true,
      provenienza: 1,
    }
  };
}

export async function createCasperFioriOrder(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch('https://api.cas-per.it/api/public/v1/fiori-ordini', {
    method: 'POST',
    headers: {
      'X-API-Key': getCasperApiKey(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json?.success === false) {
    throw new Error(formatEndpointError(json?.message)
      || formatEndpointError(json?.error)
      || formatEndpointError(json?.errors)
      || formatEndpointError(json?.data?.errors)
      || 'Non siamo riusciti a registrare l\'ordine.');
  }

  return json;
}
