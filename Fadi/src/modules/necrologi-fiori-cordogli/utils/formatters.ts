import type { Defunto } from '../types';

function formatItalianDate(dateStr?: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}

export function formatMorte(dateStr?: string) {
  return formatItalianDate(dateStr);
}

export function formatNascita(dateStr?: string) {
  return formatItalianDate(dateStr);
}

export function formatCerimoniaOra(dateTimeStr?: string) {
  if (!dateTimeStr) return '';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return '';
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `ore ${hour}:${min}`;
  } catch {
    return '';
  }
}

export function formatCerimoniaData(dateTimeStr?: string) {
  if (!dateTimeStr) return '';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate();
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return '';
  }
}

// Costruisce l'URL della foto con cache-buster basato su updated_at
export function getFotoUrl(defunto?: Defunto, updatedAt?: string): string {
  const url = defunto?.foto_url;
  if (!url) return '';
  const ts = updatedAt ? new Date(updatedAt).getTime() : '';
  return ts ? `${url}?v=${ts}` : url;
}
