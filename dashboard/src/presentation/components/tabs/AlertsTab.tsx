import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import type { ActiveAlert } from '@/domain/types';

interface Props {
  alerts: ActiveAlert[];
  city: string;
  onBroadcast: (tipo: string, mensaje: string) => Promise<void>;
}

export default function AlertsTab({ alerts, city, onBroadcast }: Props) {
  const [tipo, setTipo] = useState('inundacion');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onBroadcast(tipo, mensaje);
    setMensaje('');
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="w-5 h-5" /> Emitir alerta en {city}
        </h2>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Tipo
          <select value={tipo} onChange={e => setTipo(e.target.value)} required className="p-2 border rounded-lg text-sm">
            <option value="inundacion">Inundación</option>
            <option value="derrumbe">Derrumbe</option>
            <option value="incendio">Incendio</option>
            <option value="seguridad">Seguridad</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Mensaje
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribí el mensaje de la alerta..."
            required
            className="p-2 border rounded-lg text-sm min-h-[80px] resize-y"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? 'Enviando...' : 'Enviar alerta'}
        </button>
      </form>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Alertas activas</h2>
        {alerts.length === 0 ? (
          <p className="text-slate-500">No hay alertas activas.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {alerts.map(a => (
              <li key={a.id} className="border-b last:border-0 pb-3 last:pb-0">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white mb-1 ${badgeColor(a.tipo)}`}>
                  {a.tipo.toUpperCase()}
                </span>
                <p className="text-slate-700 text-sm">{a.mensaje}</p>
                <small className="text-slate-500">Radio: {a.radio} m</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function badgeColor(tipo: string): string {
  switch (tipo) {
    case 'inundacion':
      return 'bg-blue-500';
    case 'derrumbe':
      return 'bg-slate-500';
    case 'incendio':
      return 'bg-orange-500';
    case 'seguridad':
      return 'bg-purple-500';
    default:
      return 'bg-rose-600';
  }
}
