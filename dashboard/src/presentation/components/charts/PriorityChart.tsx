import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Stats } from '@/domain/types';

const PRIORITY_ORDER = ['critica', 'alta', 'media', 'baja'] as const;

interface Props {
  stats: Stats | null;
}

export default function PriorityChart({ stats }: Props) {
  const data = PRIORITY_ORDER.map(p => ({
    name: p.toUpperCase(),
    cantidad: stats
      ? p === 'critica'
        ? stats.criticas
        : p === 'alta'
        ? stats.altas
        : p === 'media'
        ? stats.medias
        : stats.bajas
      : 0,
  }));

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Reportes por prioridad</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#dc3545" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
