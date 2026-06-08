import type { AnnuncioData, Funerale, LuogoRiposo, Rosario, Sepoltura } from '../types';

type CeremonyOverride = {
  funerale?: Partial<Funerale>;
  rosario?: Partial<Rosario>;
  sepoltura?: Partial<Sepoltura>;
  luogo_riposo?: Partial<LuogoRiposo>;
};

const ceremonyOverrides: Record<string, CeremonyOverride> = {
  'raffaele-vita': {
    funerale: {
      data_ora: '2026-05-27T16:00:00'
    }
  },
  'domenico-sorace': {
    funerale: {
      data_ora: '2026-05-05T16:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    },
    luogo_riposo: {
      luogo: 'Abitazione di famiglia',
      indirizzo: 'Via Sant\'Antonio n. 1',
      comune: 'Acquaro'
    }
  },
  'francesco-scopacasa': {
    funerale: {
      data_ora: '2026-03-29T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'leandro-gallace': {
    funerale: {
      data_ora: '2026-03-27T16:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-dagostino-2': {
    funerale: {
      data_ora: '2026-03-05T16:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'anna-schiavello': {
    funerale: {
      data_ora: '2026-02-20T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-vincenzina-procopio': {
    funerale: {
      data_ora: '2026-02-03T10:00:00',
      luogo: 'Chiesa di San Nicola, Ciano di Gerocarne',
      comune: 'Gerocarne'
    }
  },
  'salvatore-raffaele': {
    funerale: {
      data_ora: '2026-01-02T15:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'maria-caterina-carnovale': {
    funerale: {
      data_ora: '2025-12-26T10:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'domenico-de-nardo': {
    funerale: {
      data_ora: '2025-12-15T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'antonio-silipo': {
    funerale: {
      data_ora: '2025-12-14T15:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'franco-carnovale': {
    funerale: {
      data_ora: '2025-12-10T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'antonio-muratore': {
    funerale: {
      data_ora: '2025-11-21T15:00:00',
      luogo: 'Chiesa dei Santi Filippo e Giacomo, Limpidi di Acquaro',
      comune: 'Acquaro'
    }
  },
  'rosaria-care': {
    funerale: {
      data_ora: '2024-06-30T18:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'giacomo-carnovale': {
    funerale: {
      data_ora: '2024-06-27T10:00:00',
      luogo: 'Chiesa di San Nicola, Ciano di Gerocarne',
      comune: 'Gerocarne'
    }
  },
  'anna-maria-barillaro': {
    funerale: {
      data_ora: '2024-06-07T16:00:00',
      luogo: 'Chiesa di San Nicola, Ciano di Gerocarne',
      comune: 'Gerocarne'
    }
  },
  'ferdinando-portaro': {
    funerale: {
      data_ora: '2024-06-02T10:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'nazzareno-gagliardi': {
    funerale: {
      data_ora: '2024-05-27T17:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'michele-schiavello': {
    funerale: {
      data_ora: '2024-05-22T16:00:00',
      luogo: 'Sala del Regno dei Testimoni di Geova, Acquaro',
      comune: 'Acquaro'
    }
  },
  'maria-cecilia-maiuolo': {
    funerale: {
      data_ora: '2024-05-22T17:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'umberto-scarmozzino': {
    funerale: {
      data_ora: '2024-04-16T16:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-nicolina-perino': {
    funerale: {
      data_ora: '2024-03-20T16:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'mariannina-aloe': {
    funerale: {
      data_ora: '2024-02-29T15:30:00',
      luogo: 'Chiesa di Maria SS. delle Grazie, Arena',
      comune: 'Arena'
    }
  },
  'antonietta-fusca': {
    funerale: {
      data_ora: '2024-02-14T15:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'lina-macri': {
    funerale: {
      data_ora: '2024-02-02T15:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'alfredo-dagostino-2': {
    funerale: {
      data_ora: '2024-01-27T15:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'immacolata-silipo': {
    funerale: {
      data_ora: '2024-01-13T15:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'rocco-domenico-antonio-de-angelis': {
    funerale: {
      data_ora: '2024-01-11T15:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'massimo-michele-natale': {
    funerale: {
      data_ora: '2024-01-10T15:00:00',
      luogo: 'Chiesa dei Santi Filippo e Giacomo, Limpidi di Acquaro',
      comune: 'Acquaro'
    }
  },
  'antonietta-albanese': {
    funerale: {
      data_ora: '2023-12-28T15:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'antonino-capomolla': {
    funerale: {
      data_ora: '2023-12-26T15:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'domenico-mammoliti': {
    funerale: {
      data_ora: '2023-12-26T10:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'ferdinando-barilaro': {
    funerale: {
      data_ora: '2023-12-20T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'vincenzo-dagostino': {
    funerale: {
      data_ora: '2023-11-28T15:30:00',
      luogo: 'Chiesa dei Santi Filippo e Giacomo, Limpidi di Acquaro',
      comune: 'Acquaro'
    }
  },
  'marianna-iaconis': {
    funerale: {
      data_ora: '2023-11-26T09:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-immacolata-nadile': {
    funerale: {
      data_ora: '2023-11-20T15:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'stefano-montagnese': {
    funerale: {
      data_ora: '2023-11-14T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'rosina-silipo': {
    funerale: {
      data_ora: '2023-11-09T15:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'tommasina-sorbara': {
    funerale: {
      data_ora: '2023-10-19T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'giuseppe-antonio-gioga': {
    funerale: {
      data_ora: '2023-10-05T11:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'carlo-giuseppe-amico': {
    funerale: {
      data_ora: '2023-09-29T15:30:00',
      luogo: 'Duomo di San Leoluca, Vibo Valentia',
      comune: 'Vibo Valentia'
    }
  },
  'maria-caterina-romano': {
    funerale: {
      data_ora: '2023-09-26T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'elena-tarsitani': {
    funerale: {
      data_ora: '2023-09-15T17:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'rosaria-covalea-2': {
    funerale: {
      data_ora: '2023-09-04T16:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'francesco-demasi': {
    funerale: {
      data_ora: '2023-08-25T17:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-caterina-filardo': {
    funerale: {
      data_ora: '2023-08-25T10:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'pasquale-cognetta': {
    funerale: {
      data_ora: '2023-07-16T09:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'antonietta-ciancio': {
    funerale: {
      data_ora: '2023-06-12T16:00:00',
      luogo: 'Chiesa di Santa Maria de Latinis, Arena',
      comune: 'Arena'
    }
  },
  'maria-vincenza-capomolla': {
    funerale: {
      data_ora: '2023-06-11T15:30:00',
      luogo: 'Chiesa di San Nicola, Ciano di Gerocarne',
      comune: 'Gerocarne'
    }
  },
  'giuseppe-demasi': {
    funerale: {
      data_ora: '2023-05-26T16:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'giuseppe-bruni': {
    funerale: {
      data_ora: '2023-04-28T16:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'domenico-bruni': {
    funerale: {
      data_ora: '2023-04-19T16:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'giuseppe-gioga': {
    funerale: {
      data_ora: '2023-04-18T16:00:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-rosa-pistininzi': {
    funerale: {
      data_ora: '2023-04-07T16:30:00',
      luogo: 'Chiesa di San Nicola, Ciano di Gerocarne',
      comune: 'Gerocarne'
    }
  },
  'giuseppe-pistininzi': {
    funerale: {
      data_ora: '2023-03-25T15:30:00',
      luogo: 'Chiesa di San Nicola, Ciano di Gerocarne',
      comune: 'Gerocarne'
    }
  },
  'mariantonia-agostino': {
    funerale: {
      data_ora: '2023-03-12T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'caterina-ierardo': {
    funerale: {
      data_ora: '2023-02-26T10:00:00',
      luogo: 'Chiesa dei Santi Filippo e Giacomo, Limpidi di Acquaro',
      comune: 'Acquaro'
    }
  },
  'maria-domenica-bufalo': {
    funerale: {
      data_ora: '2023-02-21T15:00:00',
      luogo: 'Chiesa Matrice, Dinami',
      comune: 'Dinami'
    }
  },
  'maria-carmela-carnovale': {
    funerale: {
      data_ora: '2023-01-29T10:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'luigi-nadile': {
    funerale: {
      data_ora: '2023-01-20T10:00:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'giuseppe-sette-3': {
    funerale: {
      data_ora: '2023-01-17T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'rosina-zappone': {
    funerale: {
      data_ora: '2022-12-19T15:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-rosa-crupi': {
    funerale: {
      data_ora: '2022-12-09T15:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'caterina-muratore': {
    funerale: {
      data_ora: '2022-10-30T15:30:00',
      luogo: 'Chiesa dei Santi Filippo e Giacomo, Limpidi di Acquaro',
      comune: 'Acquaro'
    }
  },
  'bruno-care': {
    funerale: {
      data_ora: '2022-10-26T16:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'salvatore-rosano': {
    funerale: {
      data_ora: '2022-10-05T16:30:00',
      luogo: 'Chiesa dei Santi Filippo e Giacomo, Limpidi di Acquaro',
      comune: 'Acquaro'
    }
  },
  'grazia-marina-russo': {
    funerale: {
      data_ora: '2022-08-31T11:00:00',
      luogo: 'Chiesa parrocchiale della Sacra Famiglia, Vibo Valentia',
      comune: 'Vibo Valentia'
    }
  },
  'concetta-rosaria-nardo': {
    funerale: {
      data_ora: '2022-08-18T17:00:00',
      luogo: 'Santuario di San Domenico, Soriano Calabro',
      comune: 'Soriano Calabro'
    }
  },
  'maria-domenica-colaci': {
    funerale: {
      data_ora: '2022-07-13T17:30:00',
      luogo: 'Chiesa di Santa Maria dei Latini, Acquaro',
      comune: 'Acquaro'
    }
  },
  'francesco-gallace': {
    funerale: {
      data_ora: '2022-07-07T17:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'maria-domenica-delia': {
    funerale: {
      data_ora: '2022-06-30T17:00:00',
      luogo: 'Chiesa di San Nicola e San Michele, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'francesca-porpiglia': {
    funerale: {
      data_ora: '2022-06-07T17:30:00',
      luogo: 'Chiesa parrocchiale, Dasa\'',
      comune: 'Dasa\''
    }
  },
  'domenico-sorleto': {
    funerale: {
      data_ora: '2022-05-28T15:30:00',
      luogo: 'Chiesa dei Santi Filippo e Giacomo, Limpidi di Acquaro',
      comune: 'Acquaro'
    }
  },
};

function hasMeaningfulTime(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const match = value.match(/(?:T|\s)(\d{2}):(\d{2})/);
  if (!match) return false;
  return !(match[1] === '00' && match[2] === '00');
}

function fillMissingFields<T extends Record<string, unknown>>(
  current: T | undefined,
  override: Partial<T> | undefined
): T {
  const merged = { ...(current || {}) } as T;

  if (!override) return merged;

  for (const [key, value] of Object.entries(override)) {
    if (value === undefined || value === null || value === '') continue;
    const currentValue = merged[key as keyof T];
    if (
      currentValue === undefined
      || currentValue === null
      || currentValue === ''
      || (key === 'data_ora' && !hasMeaningfulTime(currentValue) && hasMeaningfulTime(value))
    ) {
      merged[key as keyof T] = value as T[keyof T];
    }
  }

  return merged;
}

export function applyCeremonyOverrides(item: AnnuncioData): AnnuncioData {
  const override = ceremonyOverrides[item.slug];
  if (!override) return item;

  return {
    ...item,
    funerale: fillMissingFields(item.funerale, override.funerale),
    rosario: fillMissingFields(item.rosario, override.rosario),
    sepoltura: fillMissingFields(item.sepoltura, override.sepoltura),
    luogo_riposo: fillMissingFields(item.luogo_riposo, override.luogo_riposo)
  };
}






