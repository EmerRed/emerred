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
              <th className="py-2 pr-4">Señal móvil</th>
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
                <td className="py-2 pr-4">{a.potencia_red_movil} dBm</td>
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
