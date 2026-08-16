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

export type DonationCategory =
  | 'alimentos'
  | 'agua'
  | 'higiene'
  | 'ropa_cobijas'
  | 'medicamentos'
  | 'mascotas'
  | 'herramientas';

export interface DonationCenter {
  id: string;
  name: string;
  address: string;
  comuna: string;
  lat: number;
  long: number;
  schedule: string;
  phone: string;
  status: 'active' | 'urgent' | 'full';
  urgentNeeds: string[];
  acceptedCategories: DonationCategory[];
  responsibleOrg: string;
  verified: boolean;
  notes?: string;
}

export type MissingPersonStatus = 'searching' | 'safe' | 'medical' | 'shelter';

export interface MissingPerson {
  id: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F' | 'Otro';
  idDocument?: string;
  status: MissingPersonStatus;
  lastSeenLocation: string;
  comuna: string;
  lastSeenDate: string;
  description: string;
  clothing: string;
  medicalNeeds?: string;
  contactName: string;
  contactPhone: string;
  reportedAt: string;
  imageUrl?: string;
  currentShelterOrHospital?: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  comuna: string;
  lat: number;
  long: number;
  capacity: number;
  occupied: number;
  services: string[];
  status: 'available' | 'near_capacity' | 'full';
  phone: string;
  manager: string;
  notes?: string;
}

export interface HealthCenter {
  id: string;
  name: string;
  type: 'hospital' | 'caps' | 'campana';
  address: string;
  comuna: string;
  lat: number;
  long: number;
  phone: string;
  urgencyStatus: 'critical' | 'high' | 'moderate';
  specialties: string[];
  bloodUrgency?: string[];
  open24h: boolean;
  triageWaitTime?: string;
}

export interface WaterDistributionPoint {
  id: string;
  location: string;
  comuna: string;
  lat: number;
  long: number;
  schedule: string;
  status: 'arrived' | 'en_route' | 'scheduled';
  litersEstimated: number;
  vehiclePlate: string;
}

export type SosUrgencyType = 'rescue' | 'medical' | 'collapse' | 'supplies' | 'vulnerable';

export interface PublicSosReport {
  id: string;
  reporterName: string;
  phone: string;
  urgencyType: SosUrgencyType;
  description: string;
  peopleCount: number;
  hasChildrenOrElderly: boolean;
  address: string;
  comuna: string;
  lat?: number;
  long?: number;
  status: 'pending' | 'dispatched' | 'attended';
  timestamp: string;
  radicado: string;
}

export interface VolunteerApplication {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  profession: string;
  category: 'salud' | 'rescate' | 'psicologia' | 'logistica' | 'transporte' | 'veterinaria' | 'albergue';
  availability: string;
  comuna: string;
  hasVehicle: boolean;
  registeredAt: string;
}
