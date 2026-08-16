import { useState } from 'react';
import { Map, Marker } from 'pigeon-maps';
import {
  MapPin,
  HeartHandshake,
  Home,
  Activity,
  ShieldAlert,
  Droplets,
  ExternalLink,
  Phone,
  Layers,
  X,
} from 'lucide-react';
import type {
  DonationCenter,
  Shelter,
  HealthCenter,
  WaterDistributionPoint,
  PublicSosReport,
} from '@/domain/types';

interface Props {
  donationCenters: DonationCenter[];
  shelters: Shelter[];
  healthCenters: HealthCenter[];
  waterPoints: WaterDistributionPoint[];
  sosReports: PublicSosReport[];
}

type MapPointType = 'donation' | 'shelter' | 'health' | 'water' | 'sos';

interface SelectedPin {
  type: MapPointType;
  title: string;
  subtitle: string;
  address: string;
  phone?: string;
  extra: string;
  lat: number;
  long: number;
}

export default function InteractiveMapSection({
  donationCenters,
  shelters,
  healthCenters,
  waterPoints,
  sosReports,
}: Props) {
  const [center, setCenter] = useState<[number, number]>([3.435, -76.535]);
  const [zoom, setZoom] = useState(13);
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);

  // Layer toggles
  const [showDonations, setShowDonations] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showHealth, setShowHealth] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showSos, setShowSos] = useState(true);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <Layers className="w-3.5 h-3.5 text-rose-600" />
              <span>Visor Geográfico de Emergencia</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Mapa Operativo de la Ciudad de Cali
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Haga clic en cualquier marcador para consultar horarios, capacidad, servicios de emergencia y trazar la ruta.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setCenter([3.42, -76.55]);
                setZoom(14);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Ladera / Siloé
            </button>
            <button
              onClick={() => {
                setCenter([3.45, -76.53]);
                setZoom(14);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Centro / CAM
            </button>
            <button
              onClick={() => {
                setCenter([3.43, -76.54]);
                setZoom(14);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              San Fernando / HUV
            </button>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-100 text-xs font-bold">
          <button
            onClick={() => setShowDonations(!showDonations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showDonations
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Centros de Acopio ({donationCenters.length})</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showShelters
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Albergues ({shelters.length})</span>
          </button>

          <button
            onClick={() => setShowHealth(!showHealth)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showHealth
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hospitales y Salud ({healthCenters.length})</span>
          </button>

          <button
            onClick={() => setShowWater(!showWater)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showWater
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Carrotanques de Agua ({waterPoints.length})</span>
          </button>

          <button
            onClick={() => setShowSos(!showSos)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              showSos
                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Reportes SOS ({sosReports.length})</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 relative overflow-hidden">
        <div className="h-[560px] rounded-xl overflow-hidden relative">
          <Map
            height={560}
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center: newCenter, zoom: newZoom }) => {
              setCenter(newCenter);
              setZoom(newZoom);
            }}
          >
            {/* Donation Centers (Blue) */}
            {showDonations &&
              donationCenters.map(d => (
                <Marker
                  key={d.id}
                  width={34}
                  anchor={[d.lat, d.long]}
                  color="#2563eb"
                  onClick={() =>
                    setSelectedPin({
                      type: 'donation',
                      title: d.name,
                      subtitle: `Centro de Acopio (${d.comuna})`,
                      address: d.address,
                      phone: d.phone,
                      extra: `Insumos urgentes: ${d.urgentNeeds.join(', ')}`,
                      lat: d.lat,
                      long: d.long,
                    })
                  }
                />
              ))}

            {/* Shelters (Emerald) */}
            {showShelters &&
              shelters.map(s => (
                <Marker
                  key={s.id}
                  width={34}
                  anchor={[s.lat, s.long]}
                  color="#059669"
                  onClick={() =>
                    setSelectedPin({
                      type: 'shelter',
                      title: s.name,
                      subtitle: `Albergue Temporal (${s.comuna})`,
                      address: s.address,
                      phone: s.phone,
                      extra: `Ocupación: ${s.occupied}/${s.capacity} plazas (${Math.round((s.occupied / s.capacity) * 100)}%)`,
                      lat: s.lat,
                      long: s.long,
                    })
                  }
                />
              ))}

            {/* Health Centers (Rose/Red) */}
            {showHealth &&
              healthCenters.map(h => (
                <Marker
                  key={h.id}
                  width={34}
                  anchor={[h.lat, h.long]}
                  color="#e11d48"
                  onClick={() =>
                    setSelectedPin({
                      type: 'health',
                      title: h.name,
                      subtitle: `Atención Médica (${h.comuna})`,
                      address: h.address,
                      phone: h.phone,
                      extra: h.specialties.join(', '),
                      lat: h.lat,
                      long: h.long,
                    })
                  }
                />
              ))}

            {/* Water Points (Cyan) */}
            {showWater &&
              waterPoints.map(w => (
                <Marker
                  key={w.id}
                  width={32}
                  anchor={[w.lat, w.long]}
                  color="#0891b2"
                  onClick={() =>
                    setSelectedPin({
                      type: 'water',
                      title: `Carrotanque: ${w.location}`,
                      subtitle: `Agua Potable (${w.comuna})`,
                      address: w.vehiclePlate,
                      extra: `Horario: ${w.schedule} | Capacidad: ${w.litersEstimated.toLocaleString()} L`,
                      lat: w.lat,
                      long: w.long,
                    })
                  }
                />
              ))}

            {/* SOS Reports (Orange/Red) */}
            {showSos &&
              sosReports
                .filter(r => r.lat && r.long)
                .map(r => (
                  <Marker
                    key={r.id}
                    width={32}
                    anchor={[r.lat!, r.long!]}
                    color="#ea580c"
                    onClick={() =>
                      setSelectedPin({
                        type: 'sos',
                        title: `Alerta SOS: ${r.radicado}`,
                        subtitle: `${r.comuna} - ${r.peopleCount} personas afectadas`,
                        address: r.address,
                        phone: r.phone,
                        extra: r.description,
                        lat: r.lat!,
                        long: r.long!,
                      })
                    }
                  />
                ))}
          </Map>

          {/* Floating Selected Pin Detail Card */}
          {selectedPin && (
            <div className="popup-animate absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/98 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 p-5 z-20">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      selectedPin.type === 'donation'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedPin.type === 'shelter'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedPin.type === 'health'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedPin.type === 'water'
                        ? 'bg-cyan-100 text-cyan-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {selectedPin.subtitle}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedPin.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-800">{selectedPin.address}</span>
                </div>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedPin.extra}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {selectedPin.phone && (
                  <a
                    href={`tel:${selectedPin.phone.replace(/\D/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar</span>
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPin.lat},${selectedPin.long}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs transition shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Cómo Llegar</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
