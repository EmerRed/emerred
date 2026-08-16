import type { Afectado, ActiveAlert, Stats } from '@/domain/types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://emerred-production.up.railway.app';

let MOCK_ALERTS: ActiveAlert[] = [
  {
    id: 'alert-1',
    active: true,
    tipo: 'inundacion',
    mensaje: 'Riesgo de inundación en el centro. Evacuar a zonas altas.',
    ciudad: 'Bogotá',
    radio: 5000,
  },
];

export async function getAfectados(): Promise<Afectado[]> {
  try {
    const res = await fetch(`${API_BASE}/afectados`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function getActiveAlerts(): Promise<ActiveAlert[]> {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_ALERTS.filter(a => a.active)), 300));
}

function computeStats(afectados: Afectado[]): Stats {
  const total = afectados.length;
  const conMesh = afectados.filter(a => a.coneccion_mesh).length;
  const muyBaja = afectados.filter(a => a.potencia_red_movil < -100).length;
  return { total, conMesh, muyBaja };
}

export async function getStats(): Promise<Stats> {
  return { total: 0, conMesh: 0, muyBaja: 0 };
}

export async function refreshStats(afectados: Afectado[]): Promise<Stats> {
  return computeStats(afectados);
}

export async function assignReport(_reportId: string, _volunteer: string): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 100));
}

export async function broadcastAlert(alert: Omit<ActiveAlert, 'id'>): Promise<void> {
  MOCK_ALERTS.push({
    id: `alert-${Date.now()}`,
    active: true,
    tipo: alert.tipo,
    mensaje: alert.mensaje,
    ciudad: alert.ciudad ?? 'Bogotá',
    radio: alert.radio,
  });
}
