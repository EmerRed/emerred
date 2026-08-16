export interface Afectado {
  id: string;
  lat: number;
  long: number;
  numero_celular: number;
  potencia_red_movil: number;
  coneccion_mesh: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PuntoAfectado {
  id: string;
  lat: number;
  long: number;
  conteo: number;
  promedio: number;
  celulares: number[];
  conMesh: number;
}

export interface ActiveAlert {
  id: string;
  active: boolean;
  tipo: string;
  mensaje: string;
  ciudad?: string;
  dispositivosAlcanzados?: number;
  createdAt?: string;
}

export interface Stats {
  total: number;
  conMesh: number;
  muyBaja: number;
}
