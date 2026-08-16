import type { Afectado } from '@/domain/types';

interface Props {
  afectados: Afectado[];
}

export default function ReportsTab({ afectados }: Props) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Afectados recibidos</h2>
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 border-b">
            <tr>
              <th className="py-2 pr-4">Celular</th>
              <th className="py-2 pr-4">Calidad señal</th>
              <th className="py-2 pr-4">Mesh</th>
              <th className="py-2 pr-4">Latitud</th>
              <th className="py-2 pr-4">Longitud</th>
              <th className="py-2 pr-4">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {afectados.map(a => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{a.numero_celular}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${signalClass(a.potencia_red_movil)}`}>
                    {signalLabel(a.potencia_red_movil)} ({a.potencia_red_movil} dBm)
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      a.coneccion_mesh ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {a.coneccion_mesh ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="py-2 pr-4">{a.lat.toFixed(5)}</td>
                <td className="py-2 pr-4">{a.long.toFixed(5)}</td>
                <td className="py-2 pr-4">{new Date(a.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function signalClass(potencia: number): string {
  if (potencia < -100) return 'bg-red-100 text-red-800';
  if (potencia < -85) return 'bg-orange-100 text-orange-800';
  if (potencia < -70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

function signalLabel(potencia: number): string {
  if (potencia < -100) return 'Muy baja';
  if (potencia < -85) return 'Baja';
  if (potencia < -70) return 'Media';
  return 'Optima';
}
