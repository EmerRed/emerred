import { use, useState } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { broadcastAlert } from '@/data/api';
import { getDashboardData, refreshDashboardData } from '@/data/resources';
import { useIdleTimeout } from '@/presentation/hooks/useIdleTimeout';
import OverviewTab from '@/presentation/components/tabs/OverviewTab';
import AlertsTab from '@/presentation/components/tabs/AlertsTab';
import MapTab from '@/presentation/components/tabs/MapTab';
import ReportsTab from '@/presentation/components/tabs/ReportsTab';

const TABS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'alerts', label: 'Alertas' },
  { id: 'map', label: 'Mapa' },
  { id: 'reports', label: 'Reportes' },
] as const;

interface Props {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: Props) {
  useIdleTimeout();

  const [dataPromise, setDataPromise] = useState(() => getDashboardData());
  const data = use(dataPromise);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const city = data.alerts[0]?.ciudad ?? 'Bogotá';

  async function handleBroadcast(tipo: string, mensaje: string) {
    await broadcastAlert({ active: true, tipo, mensaje, ciudad: city, radio: 5000 });
    setDataPromise(refreshDashboardData());
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-rose-600">
            <AlertTriangle className="w-8 h-8" /> Emerred Admin
          </h1>
          <p className="text-slate-500 mt-1">Panel de control para operadores de emergencia</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg font-semibold transition"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </header>

      <div className="bg-white rounded-t-xl shadow-sm p-2 mb-0">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm p-5 min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'alerts' && <AlertsTab alerts={data.alerts} city={city} onBroadcast={handleBroadcast} />}
        {activeTab === 'map' && <MapTab puntos={data.puntos} city={city} />}
        {activeTab === 'reports' && <ReportsTab afectados={data.afectados} puntos={data.puntos} />}
      </div>
    </div>
  );
}
