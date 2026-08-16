import type { Report } from '@/domain/types';
import { useState } from 'react';

interface Props {
  reports: Report[];
  volunteers: string[];
  onAssign: (id: string, volunteer: string) => Promise<void>;
}

export default function ReportsTable({ reports, volunteers, onAssign }: Props) {
  const [selecting, setSelecting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function confirmAssign(id: string) {
    const volunteer = selected[id];
    if (!volunteer) return;
    setBusy(id);
    await onAssign(id, volunteer);
    setBusy(null);
    setSelecting(null);
  }

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Reportes recibidos</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 border-b">
            <tr>
              <th className="py-2 pr-4">Prioridad</th>
              <th className="py-2 pr-4">Categoría</th>
              <th className="py-2 pr-4">Mensaje</th>
              <th className="py-2 pr-4">Ubicación</th>
              <th className="py-2 pr-4">Dirección</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
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
                <td className="py-2 pr-4">{r.direccion || '—'}</td>
                <td className="py-2 pr-4">
                  {r.asignado ? `Asignado a ${r.asignado}` : 'Sin asignar'}
                </td>
                <td className="py-2 pr-4">
                  {r.asignado ? (
                    <span className="text-slate-400">—</span>
                  ) : selecting === r.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selected[r.id] ?? ''}
                        onChange={e => setSelected(prev => ({ ...prev, [r.id]: e.target.value }))}
                        className="p-1 border rounded text-xs"
                      >
                        <option value="">Elegir...</option>
                        {volunteers.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => confirmAssign(r.id)}
                        disabled={busy === r.id || !selected[r.id]}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs px-2 py-1 rounded"
                      >
                        {busy === r.id ? '...' : 'OK'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelecting(r.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                    >
                      Asignar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
