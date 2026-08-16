import { getReports, getActiveAlerts, getStats } from '@/data/api';
import type { Report, ActiveAlert, Stats } from '@/domain/types';

export interface DashboardData {
  reports: Report[];
  alerts: ActiveAlert[];
  stats: Stats;
}

let promise: Promise<DashboardData> | null = null;

async function load(): Promise<DashboardData> {
  const [reports, alerts, stats] = await Promise.all([getReports(), getActiveAlerts(), getStats()]);
  return { reports, alerts, stats };
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
