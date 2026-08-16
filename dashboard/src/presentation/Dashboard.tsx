import { useState, useEffect } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { subscribeToAfectadosUpdates } from '@/data/sse';
import { getDashboardData, appendAfectado, type DashboardData } from '@/data/resources';
import { useIdleTimeout } from '@/presentation/hooks/useIdleTimeout';
import SkeletonDashboard from '@/presentation/components/ui/SkeletonDashboard';
import OverviewTab from '@/presentation/components/tabs/OverviewTab';
import AlertsTab from '@/presentation/components/tabs/AlertsTab';
import MapTab from '@/presentation/components/tabs/MapTab';
import ReportsTab from '@/presentation/components/tabs/ReportsTab';
import type { Afectado } from '@/domain/types';

const TABS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'alerts', label: 'Alertas', badge: 'En construcción' },
  { id: 'map', label: 'Mapa de Señal' },
  { id: 'reports', label: 'Reportes y Nodos' },
] as const;

interface Props {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: Props) {
  useIdleTimeout();

  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const city = 'Cali';

  useEffect(() => {
    let mounted = true;
    getDashboardData().then(initial => {
      if (mounted) setData(initial);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    return subscribeToAfectadosUpdates((afectado: Afectado) => {
      setData(prev => (prev ? appendAfectado(prev, afectado) : prev));
    });
  }, []);

  if (!data) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-rose-600 text-white p-2 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900">EmerRed Operadores</h1>
            <p className="text-xs text-slate-500">
              Telemetría de afectados y red mesh en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </header>

      <div className="bg-white rounded-t-2xl shadow-sm border border-b-0 border-slate-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
              {'badge' in tab && tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 p-5 min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'map' && <MapTab puntos={data.puntos} city={city} />}
        {activeTab === 'reports' && <ReportsTab afectados={data.afectados} puntos={data.puntos} />}
      </div>
    </div>
  );
}
