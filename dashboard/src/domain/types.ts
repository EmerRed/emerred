export type Priority = 'critica' | 'alta' | 'media' | 'baja';

export interface Report {
  id: string;
  lat: number;
  lon: number;
  accuracy: number | null;
  prioridad: Priority;
  categoria: string;
  mensaje: string;
  asignado: string | null;
  direccion?: string;
  ciudad?: string;
  creado: string;
}

export interface ActiveAlert {
  id: string;
  active: boolean;
  tipo: string;
  mensaje: string;
  ciudad?: string;
  radio?: number;
}

export interface Stats {
  total: number;
  criticas: number;
  altas: number;
  medias: number;
  bajas: number;
  asignados: number;
  porCategoria: Record<string, number>;
}
