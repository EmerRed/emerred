import { AlertTriangle, MapPin, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import type { DashboardData } from '@/data/resources';
import StatCard from '@/presentation/components/ui/StatCard';

const COLORS = ['#dc3545', '#ffc107', '#17a2b8', '#28a745', '#6f42c1', '#fd7e14'];
const PRIORITY_ORDER = ['critica', 'alta', 'media', 'baja'] as const;

interface Props {
  data: DashboardData;
}

export default function OverviewTab({ data }: Props) {
  const { reports, alerts, stats } = data;

  const priorityData = PRIORITY_ORDER.map(p => ({
    name: p.toUpperCase(),
    cantidad: p === 'critica' ? stats.criticas : p === 'alta' ? stats.altas : p === 'media' ? stats.medias : stats.bajas,
  }));

  const categoryData = Object.entries(stats.porCategoria).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MapPin} value={stats.total} label="Reportes totales" />
        <StatCard icon={AlertTriangle} value={stats.criticas} label="Críticas" variant="urgent" />
        <StatCard icon={Users} value={stats.asignados} label="Asignados" />
        <StatCard icon={Activity} value={alerts.length} label="Alertas activas" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Reportes por prioridad</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#dc3545" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Distribución por categoría</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="35%" cy="50%" outerRadius={70}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Últimos reportes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="py-2 pr-4">Prioridad</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4">Mensaje</th>
                <th className="py-2 pr-4">Ubicación</th>
                <th className="py-2 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 5).map(r => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${priorityClass(r.prioridad)}`}>
                      {r.prioridad.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{r.categoria}</td>
                  <td className="py-2 pr-4">{r.mensaje}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {r.lat.toFixed(5)}, {r.lon.toFixed(5)}
                  </td>
                  <td className="py-2 pr-4">{r.asignado ? `Asignado a ${r.asignado}` : 'Sin asignar'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function priorityClass(prioridad: string): string {
  switch (prioridad) {
    case 'critica':
      return 'bg-red-100 text-red-800';
    case 'alta':
      return 'bg-yellow-100 text-yellow-800';
    case 'media':
      return 'bg-cyan-100 text-cyan-800';
    case 'baja':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}
