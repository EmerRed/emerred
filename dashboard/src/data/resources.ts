import { getAfectados } from '@/data/api';
import { aggregateByLocation } from '@/data/aggregation';
import type { Afectado, PuntoAfectado, Stats } from '@/domain/types';

export interface DashboardData {
  afectados: Afectado[];
  puntos: PuntoAfectado[];
  stats: Stats;
}

function computeStats(afectados: Afectado[]): Stats {
  const total = afectados.length;
  const conMesh = afectados.filter(a => a.coneccion_mesh).length;
  const muyBaja = afectados.filter(a => a.potencia_red_movil < -100).length;
  return { total, conMesh, muyBaja };
}

export function buildDashboardData(afectados: Afectado[]): DashboardData {
  const puntos = aggregateByLocation(afectados);
  return { afectados, puntos, stats: computeStats(afectados) };
}

export function appendAfectado(
  data: DashboardData,
  afectado: Afectado
): DashboardData {
  const afectados = [afectado, ...data.afectados];
  const puntos = aggregateByLocation(afectados);
  return { ...data, afectados, puntos, stats: computeStats(afectados) };
}

export async function getDashboardData(): Promise<DashboardData> {
  const afectados = await getAfectados();
  return buildDashboardData(afectados);
}

export async function refreshDashboardData(): Promise<DashboardData> {
  return getDashboardData();
}
