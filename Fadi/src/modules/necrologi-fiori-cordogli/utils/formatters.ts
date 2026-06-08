import type { Defunto } from '../types';

function formatItalianDate(dateStr?: string) {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
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

function parseCeremonyDateTime(dateTimeStr?: string) {
  if (!dateTimeStr) return null;

  const match = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = match[4] ? Number(match[4]) : null;
    const minute = match[5] ? Number(match[5]) : null;

    return {
      year,
      month,
      day,
      hour,
      minute,
      hasTime: hour !== null && minute !== null && !(hour === 0 && minute === 0)
    };
  }

  const d = new Date(dateTimeStr);
  if (isNaN(d.getTime())) return null;

  const hour = d.getHours();
  const minute = d.getMinutes();

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour,
    minute,
    hasTime: !(hour === 0 && minute === 0)
  };
}

export function formatCerimoniaOra(dateTimeStr?: string) {
  const parsed = parseCeremonyDateTime(dateTimeStr);
  if (!parsed?.hasTime || parsed.hour === null || parsed.minute === null) return '';
  const hour = String(parsed.hour).padStart(2, '0');
  const min = String(parsed.minute).padStart(2, '0');
  return `ore ${hour}:${min}`;
}

export function formatCerimoniaData(dateTimeStr?: string) {
  const parsed = parseCeremonyDateTime(dateTimeStr);
  if (!parsed) return '';
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return `${parsed.day} ${months[parsed.month - 1]} ${parsed.year}`;
}

export function formatCerimoniaBreve(dateTimeStr?: string) {
  const parsed = parseCeremonyDateTime(dateTimeStr);
  if (!parsed) return '';
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const time = formatCerimoniaOra(dateTimeStr);
  return `${parsed.day} ${months[parsed.month - 1]}${time ? ` alle ${time}` : ''}`;
}

// Costruisce l'URL della foto con cache-buster basato su updated_at
export function getFotoUrl(defunto?: Defunto, updatedAt?: string): string {
  const url = defunto?.foto_url;
  if (!url) return '';
  const ts = updatedAt ? new Date(updatedAt).getTime() : '';
  return ts ? `${url}?v=${ts}` : url;
}
