import { getAfectados, getActiveAlerts } from '@/data/api';
import type { Afectado, ActiveAlert, Stats } from '@/domain/types';

export interface DashboardData {
  afectados: Afectado[];
  alerts: ActiveAlert[];
  stats: Stats;
}

let promise: Promise<DashboardData> | null = null;

function computeStats(afectados: Afectado[]): Stats {
  const total = afectados.length;
  const conMesh = afectados.filter(a => a.coneccion_mesh).length;
  const potenciaBaja = afectados.filter(a => a.potencia_red_movil < -85).length;
  return { total, conMesh, potenciaBaja };
}

async function load(): Promise<DashboardData> {
  const [afectados, alerts] = await Promise.all([getAfectados(), getActiveAlerts()]);
  return { afectados, alerts, stats: computeStats(afectados) };
}

export function getDashboardData(): Promise<DashboardData> {
  if (!promise) {
    promise = load();
  }
  return promise;
}

export function refreshDashboardData(): Promise<DashboardData> {
  promise = load();
  return promise;
}
