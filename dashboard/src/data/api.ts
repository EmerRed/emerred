import { getAuthToken } from './auth';
import type { Afectado } from '@/domain/types';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://emerred-production.up.railway.app';

export interface AlarmaResult {
  dispositivosAlcanzados: number;
  dispositivosConectados: number;
  timestamp: string;
  message?: string;
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getAlarmaWebSocketUrl(): string {
  try {
    const url = new URL(API_BASE);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/alarma';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return 'wss://emerred-production.up.railway.app/alarma';
  }
}

export async function getAfectados(): Promise<Afectado[]> {
  try {
    const res = await fetch(`${API_BASE}/afectados`, { headers: authHeaders() });
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function getDispositivosAlarma(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/alarma/dispositivos`, { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok || !json.success) return 0;
    return json.data?.dispositivosConectados ?? 0;
  } catch {
    return 0;
  }
}

export async function activarAlarma(payload: {
  tipo: string;
  mensaje: string;
}): Promise<AlarmaResult> {
  const res = await fetch(`${API_BASE}/alarma/activar`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({ success: false, message: 'Respuesta no válida' }));
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Error al activar la alarma');
  }
  return {
    ...json.data,
    message: json.message,
  };
}
