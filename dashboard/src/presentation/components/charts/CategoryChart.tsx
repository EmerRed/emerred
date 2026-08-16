import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { Stats } from '@/domain/types';

const COLORS = ['#dc3545', '#ffc107', '#17a2b8', '#28a745'];

interface Props {
  stats: Stats | null;
}

export default function CategoryChart({ stats }: Props) {
  const data = stats
    ? Object.entries(stats.porCategoria).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Distribución por categoría</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
