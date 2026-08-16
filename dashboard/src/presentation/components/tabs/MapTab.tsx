import { useState } from 'react';
import { Map, Marker } from 'pigeon-maps';
import type { Report } from '@/domain/types';

interface Props {
  reports: Report[];
  city: string;
}

export default function MapTab({ reports, city }: Props) {
  const [selected, setSelected] = useState<Report | null>(null);
  const center = getCenter(reports);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Mapa de calor — {city}</h2>
      <div className="h-[500px] rounded-lg overflow-hidden relative">
        <Map height={500} defaultCenter={center} defaultZoom={13}>
          {reports.map(r => (
            <Marker
              key={r.id}
              width={30}
              anchor={[r.lat, r.lon]}
              color={priorityColor(r.prioridad)}
              onClick={() => setSelected(r)}
            />
          ))}
        </Map>

        {selected && (
          <div key={selected.id} className="popup-animate absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white rounded-xl shadow-lg p-4 z-10">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-800">Reporte {selected.id}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white mt-1 ${badgeBg(selected.prioridad)}`}
            >
              {selected.prioridad.toUpperCase()}
            </span>
            <p className="text-sm text-slate-600 mt-2">{selected.mensaje}</p>
            <p className="text-xs text-slate-500 mt-2">Categoría: {selected.categoria}</p>
            <p className="text-xs text-slate-500">Dirección: {selected.direccion || '—'}</p>
            <p className="text-xs text-slate-500">Asignado: {selected.asignado ?? 'Sin asignar'}</p>
            <p className="text-xs text-slate-400 mt-1">
              {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-2">Hacé click en un pin para ver el detalle.</p>

      <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
        {[
          { label: 'Crítica', color: '#dc3545' },
          { label: 'Alta', color: '#ffc107' },
          { label: 'Media', color: '#17a2b8' },
          { label: 'Baja', color: '#28a745' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-white shadow" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCenter(reports: Report[]): [number, number] {
  if (reports.length === 0) return [4.6, -74.07];
  const lat = reports.reduce((s, r) => s + r.lat, 0) / reports.length;
  const lon = reports.reduce((s, r) => s + r.lon, 0) / reports.length;
  return [lat, lon];
}

function priorityColor(prioridad: string): string {
  switch (prioridad) {
    case 'critica':
      return '#dc3545';
    case 'alta':
      return '#ffc107';
    case 'media':
      return '#17a2b8';
    case 'baja':
      return '#28a745';
    default:
      return '#6c757d';
  }
}

function badgeBg(prioridad: string): string {
  switch (prioridad) {
    case 'critica':
      return 'bg-red-600';
    case 'alta':
      return 'bg-yellow-500';
    case 'media':
      return 'bg-cyan-500';
    case 'baja':
      return 'bg-green-500';
    default:
      return 'bg-slate-500';
  }
}
