export interface Defunto {
  nome?: string;
  cognome?: string;
  data_nascita?: string; // YYYY-MM-DD
  data_morte?: string;   // YYYY-MM-DD
  foto_url?: string;
}

export interface Annuncio {
  paese?: string;
  epigrafe_url?: string;
}

export interface Funerale {
  data_ora?: string;
  luogo?: string;
  indirizzo?: string;
  comune?: string;
  link_maps?: string;
}

export interface Rosario {
  data_ora?: string;
  luogo?: string;
  indirizzo?: string;
  comune?: string;
  link_maps?: string;
}

export interface Sepoltura {
  data_ora?: string;
  luogo?: string;
  indirizzo?: string;
  comune?: string;
  link_maps?: string;
}

export interface LuogoRiposo {
  data_ora_da?: string;
  data_ora_a?: string;
  luogo?: string;
  indirizzo?: string;
  comune?: string;
  link_maps?: string;
}

export interface Streaming {
  url?: string;
  url_video?: string;
}

export interface Messaggio {
  id: number;
  mittente: string;
  testo: string;
  data_creazione: string;
  stato?: string;
}

export interface CordoglioData {
  id: number;
  annuncio_id?: number;
  testo?: string;
  mittente?: string;
  visibile?: boolean | number | string;
  pubblico?: boolean | number | string;
  pubblica?: boolean | number | string;
  public?: boolean | number | string;
  created_at?: string;
  data_creazione?: string;
  utente?: {
    nome?: string;
  };
}

export interface FotoCordoglioData {
  id?: number;
  url?: string;
  foto_url?: string;
  image_url?: string;
  immagine_url?: string;
  src?: string;
  didascalia?: string;
  caption?: string;
  descrizione?: string;
  approvata?: boolean | number | string;
  approvato?: boolean | number | string;
  visibile?: boolean | number | string;
}

export interface FotoCordoglioAlbum {
  id?: number;
  foto?: FotoCordoglioData[];
  photos?: FotoCordoglioData[];
}

export interface AnnuncioData {
  id: number;
  slug: string;
  nominativo: string;
  defunto: Defunto;
  annuncio: Annuncio;
  funerale: Funerale;
  rosario: Rosario;
  sepoltura: Sepoltura;
  luogo_riposo: LuogoRiposo;
  streaming: Streaming;
  messaggi?: Messaggio[];
  updated_at?: string;
}

export interface ApiResponse {
  data: AnnuncioData[];
}

export interface FioreData {
  id: number | string;
  nome?: string;
  denominazione?: string;
  titolo?: string;
  name?: string;
  descrizione?: string;
  descrizione_breve?: string;
  description?: string;
  importo?: number | string;
  prezzo?: number | string;
  prezzo_ivato?: number | string;
  price?: number | string;
  amount?: number | string;
  immagine_url?: string;
  immagine?: string;
  foto_url?: string;
  image_url?: string;
  url_immagine?: string;
  attivo?: boolean | number | string;
}

export interface FioriApiResponse {
  data?: FioreData[] | { fiori?: FioreData[] };
  fiori?: FioreData[];
}

export interface CordogliApiResponse {
  data?: CordoglioData[] | { cordogli?: CordoglioData[] };
  cordogli?: CordoglioData[];
}

export interface FotoCordogliApiResponse {
  data?: FotoCordoglioAlbum[] | { albums?: FotoCordoglioAlbum[] };
  albums?: FotoCordoglioAlbum[];
}
