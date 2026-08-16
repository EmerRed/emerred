import { getAuthToken } from './auth';
import type { Afectado, ActiveAlert } from '@/domain/types';

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
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE}/afectados`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
