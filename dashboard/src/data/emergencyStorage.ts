import type {
  DonationCenter,
  MissingPerson,
  Shelter,
  HealthCenter,
  WaterDistributionPoint,
  PublicSosReport,
  VolunteerApplication,
} from '@/domain/types';
import {
  INITIAL_DONATION_CENTERS,
  INITIAL_MISSING_PERSONS,
  INITIAL_SHELTERS,
  INITIAL_HEALTH_CENTERS,
  INITIAL_WATER_POINTS,
  INITIAL_SOS_REPORTS,
} from './caliEmergencyData';
import { API_BASE } from './api';

const STORAGE_KEYS = {
  DONATIONS: 'emerred_cali_donations',
  MISSING: 'emerred_cali_missing',
  SHELTERS: 'emerred_cali_shelters',
  HEALTH: 'emerred_cali_health',
  WATER: 'emerred_cali_water',
  SOS: 'emerred_cali_sos',
  VOLUNTEERS: 'emerred_cali_volunteers',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
}

export function getDonationCenters(): DonationCenter[] {
  return loadFromStorage<DonationCenter[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATION_CENTERS);
}

export function getMissingPersons(): MissingPerson[] {
  return loadFromStorage<MissingPerson[]>(STORAGE_KEYS.MISSING, INITIAL_MISSING_PERSONS);
}

export function addMissingPerson(person: Omit<MissingPerson, 'id' | 'reportedAt'>): MissingPerson {
  const current = getMissingPersons();
  const newPerson: MissingPerson = {
    ...person,
    id: `mis-${Date.now()}`,
    reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  const updated = [newPerson, ...current];
  saveToStorage(STORAGE_KEYS.MISSING, updated);
  return newPerson;
}

export function updateMissingPersonStatus(
  id: string,
  status: MissingPerson['status'],
  note?: string
): MissingPerson | null {
  const current = getMissingPersons();
  let updatedPerson: MissingPerson | null = null;
  const updated = current.map(p => {
    if (p.id === id) {
      updatedPerson = {
        ...p,
        status,
        currentShelterOrHospital: note ?? p.currentShelterOrHospital,
      };
      return updatedPerson;
    }
    return p;
  });
  if (updatedPerson) {
    saveToStorage(STORAGE_KEYS.MISSING, updated);
  }
  return updatedPerson;
}

export function getShelters(): Shelter[] {
  return loadFromStorage<Shelter[]>(STORAGE_KEYS.SHELTERS, INITIAL_SHELTERS);
}

export function getHealthCenters(): HealthCenter[] {
  return loadFromStorage<HealthCenter[]>(STORAGE_KEYS.HEALTH, INITIAL_HEALTH_CENTERS);
}

export function getWaterPoints(): WaterDistributionPoint[] {
  return loadFromStorage<WaterDistributionPoint[]>(STORAGE_KEYS.WATER, INITIAL_WATER_POINTS);
}

export function getSosReports(): PublicSosReport[] {
  return loadFromStorage<PublicSosReport[]>(STORAGE_KEYS.SOS, INITIAL_SOS_REPORTS);
}

export async function createSosReport(
  report: Omit<PublicSosReport, 'id' | 'timestamp' | 'status' | 'radicado'>
): Promise<PublicSosReport> {
  const current = getSosReports();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const radicado = `EMER-CALI-${new Date().getFullYear()}-${randomSuffix}`;
  const newSos: PublicSosReport = {
    ...report,
    id: `sos-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'pending',
    radicado,
  };

  const updated = [newSos, ...current];
  saveToStorage(STORAGE_KEYS.SOS, updated);

  // Try to sync with EmerRed Backend API if coordinates are provided
  if (report.lat && report.long && report.phone) {
    try {
      const cleanPhone = parseInt(report.phone.replace(/\D/g, '').slice(-10), 10);
      if (!isNaN(cleanPhone) && cleanPhone >= 3000000000) {
        await fetch(`${API_BASE}/afectados`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: report.lat,
            long: report.long,
            numero_celular: cleanPhone,
            potencia_red_movil: -90,
            coneccion_mesh: false,
          }),
        }).catch(() => {
          // Non-blocking sync
        });
      }
    } catch {
      // Ignore API errors
    }
  }

  return newSos;
}

export function getVolunteers(): VolunteerApplication[] {
  return loadFromStorage<VolunteerApplication[]>(STORAGE_KEYS.VOLUNTEERS, [
    {
      id: 'vol-1',
      fullName: 'Dra. Marcela Restrepo',
      phone: '318 456 7890',
      email: 'm.restrepo@gmail.com',
      profession: 'Médica General / Especialista en Urgencias',
      category: 'salud',
      availability: 'Turno Nocturno (06:00 PM - 06:00 AM)',
      comuna: 'Comuna 19',
      hasVehicle: true,
      registeredAt: '2026-08-16 02:30',
    },
    {
      id: 'vol-2',
      fullName: 'Esteban Cárdenas',
      phone: '312 901 2345',
      email: 'esteban.c@hotmail.com',
      profession: 'Conductor Camioneta 4x4 / Rescatista',
      category: 'transporte',
      availability: 'Tiempo Completo',
      comuna: 'Comuna 2 (Norte)',
      hasVehicle: true,
      registeredAt: '2026-08-16 03:15',
    },
  ]);
}

export function registerVolunteer(
  vol: Omit<VolunteerApplication, 'id' | 'registeredAt'>
): VolunteerApplication {
  const current = getVolunteers();
  const newVol: VolunteerApplication = {
    ...vol,
    id: `vol-${Date.now()}`,
    registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  const updated = [newVol, ...current];
  saveToStorage(STORAGE_KEYS.VOLUNTEERS, updated);
  return newVol;
}
