import { Map, Marker } from 'pigeon-maps';
import type { Report } from '@/domain/types';

interface Props {
  reports: Report[];
  city: string;
}

export default function HeatMap({ reports, city }: Props) {
  const center = getCenter(reports);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Mapa de calor — {city}</h2>
      <div className="h-80 rounded-lg overflow-hidden">
        <Map height={320} defaultCenter={center} defaultZoom={12}>
          {reports.map(r => (
            <Marker key={r.id} width={30} anchor={[r.lat, r.lon]} color={priorityColor(r.prioridad)} />
          ))}
        </Map>
      </div>
      <p className="text-xs text-slate-400 mt-2">Cada punto representa un reporte por prioridad.</p>
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
