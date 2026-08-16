import { useState } from 'react';
import { X } from 'lucide-react';
import type { Afectado, PuntoAfectado } from '@/domain/types';

interface Props {
  afectados: Afectado[];
  puntos: PuntoAfectado[];
}

export default function ReportsTab({ afectados, puntos }: Props) {
  const [selectedCelulares, setSelectedCelulares] = useState<number[] | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Puntos agrupados por ubicación ({puntos.length})</h2>
        <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="py-2 pr-4">Repeticiones</th>
                <th className="py-2 pr-4">Promedio señal</th>
                <th className="py-2 pr-4">Con mesh</th>
                <th className="py-2 pr-4">Latitud</th>
                <th className="py-2 pr-4">Longitud</th>
                <th className="py-2 pr-4">Celulares</th>
              </tr>
            </thead>
            <tbody>
              {puntos.map(p => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-semibold">{p.conteo}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${signalClass(p.promedio)}`}>
                      {signalLabel(p.promedio)} ({p.promedio} dBm)
                    </span>
                  </td>
                  <td className="py-2 pr-4">{p.conMesh} de {p.conteo}</td>
                  <td className="py-2 pr-4">{p.lat.toFixed(5)}</td>
                  <td className="py-2 pr-4">{p.long.toFixed(5)}</td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => setSelectedCelulares(p.celulares)}
                      className="text-rose-600 hover:text-rose-800 font-semibold underline"
                    >
                      Ver {p.celulares.length} celulares
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Registros individuales ({afectados.length})</h2>
        <div className="overflow-x-auto max-h-[40vh] overflow-y-auto">
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
                  <td className="py-2 pr-4">{a.coneccion_mesh ? 'Sí' : 'No'}</td>
                  <td className="py-2 pr-4">{a.lat.toFixed(5)}</td>
                  <td className="py-2 pr-4">{a.long.toFixed(5)}</td>
                  <td className="py-2 pr-4">{new Date(a.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCelulares && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Celulares en el punto</h3>
              <button
                onClick={() => setSelectedCelulares(null)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="overflow-y-auto space-y-1 pr-2 text-sm text-slate-700">
              {selectedCelulares.map((c, i) => (
                <li key={`${c}-${i}`} className="py-1 border-b last:border-0">{String(c)}</li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedCelulares(null)}
              className="mt-4 bg-rose-600 text-white rounded-lg py-2 font-semibold hover:bg-rose-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
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
