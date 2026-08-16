import { Users, Wifi, Signal, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { DashboardData } from '@/data/resources';
import StatCard from '@/presentation/components/ui/StatCard';

const PIE_COLORS = ['#28a745', '#dc3545'];

interface Props {
  data: DashboardData;
}

export default function OverviewTab({ data }: Props) {
  const { afectados, stats } = data;

  const signalData = [
    { name: 'Muy baja (< -100)', cantidad: afectados.filter(a => a.potencia_red_movil < -100).length },
    { name: 'Baja (-100 a -85)', cantidad: afectados.filter(a => a.potencia_red_movil >= -100 && a.potencia_red_movil < -85).length },
    { name: 'Media (-85 a -70)', cantidad: afectados.filter(a => a.potencia_red_movil >= -85 && a.potencia_red_movil < -70).length },
    { name: 'Optima (> -70)', cantidad: afectados.filter(a => a.potencia_red_movil >= -70).length },
  ];

  const meshData = [
    { name: 'Con mesh', value: afectados.filter(a => a.coneccion_mesh).length },
    { name: 'Sin mesh', value: afectados.filter(a => !a.coneccion_mesh).length },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} value={stats.total} label="Afectados totales" />
        <StatCard icon={Wifi} value={stats.conMesh} label="Con conexión mesh" />
        <StatCard icon={Signal} value={stats.muyBaja} label="Señal muy baja" variant="urgent" />
        <StatCard icon={Activity} value={data.alerts.length} label="Alertas activas" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Calidad de señal móvil</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#dc3545" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Conexión mesh</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={meshData} dataKey="value" nameKey="name" cx="35%" cy="50%" outerRadius={70}>
                  {meshData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
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
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${signalClass(a.potencia_red_movil)}`}>
                      {a.potencia_red_movil} dBm
                    </span>
                  </td>
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

function signalClass(potencia: number): string {
  if (potencia < -100) return 'bg-red-100 text-red-800';
  if (potencia < -85) return 'bg-orange-100 text-orange-800';
  if (potencia < -70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}
