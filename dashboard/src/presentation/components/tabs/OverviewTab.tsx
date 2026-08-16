import { Users, Wifi, Signal, Activity } from 'lucide-react';
import type { DashboardData } from '@/data/resources';
import StatCard from '@/presentation/components/ui/StatCard';

interface Props {
  data: DashboardData;
}

export default function OverviewTab({ data }: Props) {
  const { afectados, stats } = data;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} value={stats.total} label="Afectados totales" />
        <StatCard icon={Wifi} value={stats.conMesh} label="Con conección mesh" />
        <StatCard icon={Signal} value={stats.potenciaBaja} label="Señal móvil baja" variant="urgent" />
        <StatCard icon={Activity} value={data.alerts.length} label="Alertas activas" />
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Últimos afectados</h2>
        <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="py-2 pr-4">Celular</th>
                <th className="py-2 pr-4">Señal móvil</th>
                <th className="py-2 pr-4">Mesh</th>
                <th className="py-2 pr-4">Lat</th>
                <th className="py-2 pr-4">Long</th>
                <th className="py-2 pr-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {afectados.slice(0, 8).map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{a.numero_celular}</td>
                  <td className="py-2 pr-4">{a.potencia_red_movil} dBm</td>
                  <td className="py-2 pr-4">{a.coneccion_mesh ? 'Sí' : 'No'}</td>
                  <td className="py-2 pr-4">{a.lat.toFixed(5)}</td>
                  <td className="py-2 pr-4">{a.long.toFixed(5)}</td>
                  <td className="py-2 pr-4">{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
