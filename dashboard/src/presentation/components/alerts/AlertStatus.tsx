import type { ActiveAlert } from '@/domain/types';

interface Props {
  alerts: ActiveAlert[];
}

export default function AlertStatus({ alerts }: Props) {
  return (
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
