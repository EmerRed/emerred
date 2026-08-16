import { useCallback, useEffect, useState } from 'react';
import { Megaphone, Radio, Smartphone, Wifi, WifiOff } from 'lucide-react';
import type { ActiveAlert } from '@/domain/types';
import type { AlarmaResult } from '@/data/api';
import { getAlarmaWebSocketUrl, getDispositivosAlarma } from '@/data/api';

interface Props {
  city: string;
  historial: ActiveAlert[];
  onActivar: (tipo: string, mensaje: string) => Promise<AlarmaResult>;
}

export default function AlertsTab({ city, historial, onActivar }: Props) {
  const [tipo, setTipo] = useState('inundacion');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoResultado, setUltimoResultado] = useState<AlarmaResult | null>(null);
  const [dispositivosConectados, setDispositivosConectados] = useState<number | null>(null);
  const [wsProbe, setWsProbe] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const wsUrl = getAlarmaWebSocketUrl();

  const refreshDispositivos = useCallback(async () => {
    const count = await getDispositivosAlarma();
    setDispositivosConectados(count);
    return count;
  }, []);

  useEffect(() => {
    let mounted = true;
    refreshDispositivos();
    const interval = setInterval(() => {
      if (mounted) refreshDispositivos();
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshDispositivos]);

  async function probarCanalWebSocket() {
    setWsProbe('testing');
    try {
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Tiempo de espera agotado'));
        }, 8000);
        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve();
        };
        ws.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('No se pudo conectar al canal WebSocket'));
        };
      });
      setWsProbe('ok');
      await refreshDispositivos();
    } catch {
      setWsProbe('fail');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const conectados = dispositivosConectados ?? await refreshDispositivos();
    if (conectados === 0) {
      const continuar = window.confirm(
        'No hay dispositivos móviles conectados al canal WebSocket.\n\n' +
          'La alarma solo llega a apps con EmerRed abierta y el endpoint configurado.\n\n' +
          '¿Deseás activar la alarma de todos modos?'
      );
      if (!continuar) return;
    }

    setLoading(true);
    try {
      const result = await onActivar(tipo, mensaje);
      setUltimoResultado(result);
      setDispositivosConectados(result.dispositivosConectados ?? result.dispositivosAlcanzados);
      setMensaje('');
      await refreshDispositivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar la alarma');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm space-y-3 border border-rose-100">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Megaphone className="w-5 h-5 text-rose-600" /> Activar alarma en {city}
        </h2>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-2">
          <p className="flex items-start gap-2">
            <Radio className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
            <span>
              Al confirmar, el servidor envía <code className="text-xs bg-white px-1 rounded">{'{"alarma": true}'}</code> por
              WebSocket a <code className="text-xs bg-white px-1 rounded break-all">{wsUrl}</code> para{' '}
              <strong>todos los dispositivos móviles conectados</strong>.
            </span>
          </p>
          <p className="flex items-center gap-2 font-semibold text-slate-700">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            Dispositivos conectados ahora:{' '}
            {dispositivosConectados === null ? '…' : dispositivosConectados}
          </p>
          {dispositivosConectados === 0 && (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
              Ninguna app móvil está escuchando. Abrí EmerRed en el celular con el endpoint{' '}
              <code className="bg-white px-1 rounded">{import.meta.env.VITE_API_URL || 'https://emerred-production.up.railway.app'}</code>{' '}
              configurado en Telemetría.
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={probarCanalWebSocket}
              disabled={wsProbe === 'testing'}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-white transition"
            >
              {wsProbe === 'testing' ? (
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
              ) : wsProbe === 'fail' ? (
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {wsProbe === 'testing' ? 'Probando canal…' : 'Probar canal WebSocket'}
            </button>
            {wsProbe === 'ok' && <span className="text-xs text-emerald-700">Canal accesible</span>}
            {wsProbe === 'fail' && <span className="text-xs text-red-600">Canal no accesible</span>}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold">
          Tipo (registro interno)
          <select value={tipo} onChange={e => setTipo(e.target.value)} required className="p-2 border rounded-lg text-sm">
            <option value="inundacion">Inundación</option>
            <option value="derrumbe">Derrumbe</option>
            <option value="incendio">Incendio</option>
            <option value="seguridad">Seguridad</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Notas del operador (registro interno)
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Contexto de la activación para el registro del operador..."
            required
            className="p-2 border rounded-lg text-sm min-h-[80px] resize-y"
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {ultimoResultado && (
          <p
            className={`text-sm rounded-lg p-2 border ${
              ultimoResultado.dispositivosAlcanzados > 0
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}
          >
            {ultimoResultado.message ?? (
              <>
                Alarma difundida a {ultimoResultado.dispositivosAlcanzados} dispositivo(s)
              </>
            )}
            {' — '}
            {new Date(ultimoResultado.timestamp).toLocaleString('es-CO')}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Activando alarma...' : 'Activar alarma de emergencia'}
        </button>
      </form>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Activaciones en esta sesión</h2>
        {historial.length === 0 ? (
          <p className="text-slate-500">No hay activaciones registradas en esta sesión.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {historial.map(a => (
              <li key={a.id} className="border-b last:border-0 pb-3 last:pb-0">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white mb-1 ${badgeColor(a.tipo)}`}>
                  {a.tipo.toUpperCase()}
                </span>
                <p className="text-slate-700 text-sm">{a.mensaje}</p>
                {a.dispositivosAlcanzados != null && (
                  <small className="text-slate-500">
                    {a.dispositivosAlcanzados} dispositivo(s) — {new Date(a.createdAt ?? '').toLocaleString('es-CO')}
                  </small>
                )}
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
