import { useEffect, useState } from 'react';
import { Map, Marker } from 'pigeon-maps';
import type { Afectado } from '@/domain/types';
import { getAddress } from '@/data/geocoding';

interface Props {
  afectados: Afectado[];
  city: string;
}

export default function MapTab({ afectados, city }: Props) {
  const [selected, setSelected] = useState<Afectado | null>(null);
  const [address, setAddress] = useState<string>('Cargando dirección...');
  const center = getCenter(afectados);

  useEffect(() => {
    if (!selected) return;
    setAddress('Cargando dirección...');
    let cancelled = false;
    getAddress(selected.lat, selected.long).then(addr => {
      if (!cancelled) setAddress(addr);
    });
    return () => { cancelled = true; };
  }, [selected]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Mapa — {city}</h2>
      <div className="h-[500px] rounded-lg overflow-hidden relative">
        <Map height={500} defaultCenter={center} defaultZoom={13}>
          {afectados.map(a => (
            <Marker
              key={a.id}
              width={30}
              anchor={[a.lat, a.long]}
              color={signalColor(a.potencia_red_movil)}
              onClick={() => setSelected(a)}
            />
          ))}
        </Map>

        {selected && (
          <div key={selected.id} className="popup-animate absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-lg p-4 z-10">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-800">Afectado</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
            </div>
            <p className="text-sm text-slate-600 mt-2"><strong>Celular:</strong> {selected.numero_celular}</p>
            <p className="text-sm text-slate-600"><strong>Señal:</strong> {signalLabel(selected.potencia_red_movil)} ({selected.potencia_red_movil} dBm)</p>
            <p className="text-sm text-slate-600"><strong>Mesh:</strong> {selected.coneccion_mesh ? 'Sí' : 'No'}</p>
            <p className="text-sm text-slate-600"><strong>Ubicación:</strong> {selected.lat.toFixed(5)}, {selected.long.toFixed(5)}</p>
            <p className="text-sm text-slate-600 mt-2 line-clamp-3" title={address}><strong>Dirección:</strong> {address}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-2">Hacé click en un pin para ver el detalle.</p>

      <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
        {[
          { label: 'Muy baja (< -100)', color: '#dc3545' },
          { label: 'Baja (-100 a -85)', color: '#fd7e14' },
          { label: 'Media (-85 a -70)', color: '#ffc107' },
          { label: 'Optima (> -70)', color: '#28a745' },
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

function getCenter(afectados: Afectado[]): [number, number] {
  if (afectados.length === 0) return [4.6, -74.07];
  const lat = afectados.reduce((s, a) => s + a.lat, 0) / afectados.length;
  const long = afectados.reduce((s, a) => s + a.long, 0) / afectados.length;
  return [lat, long];
}

function signalColor(potencia: number): string {
  if (potencia < -100) return '#dc3545';
  if (potencia < -85) return '#fd7e14';
  if (potencia < -70) return '#ffc107';
  return '#28a745';
}

function signalLabel(potencia: number): string {
  if (potencia < -100) return 'Muy baja';
  if (potencia < -85) return 'Baja';
  if (potencia < -70) return 'Media';
  return 'Optima';
}
