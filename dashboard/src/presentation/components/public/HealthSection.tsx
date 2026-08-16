import { useState } from 'react';
import {
  Activity,
  MapPin,
  Phone,
  ExternalLink,
  Clock,
  Droplet,
} from 'lucide-react';
import type { HealthCenter } from '@/domain/types';

interface Props {
  healthCenters: HealthCenter[];
  onNavigateToMap?: (centerId: string) => void;
}

export default function HealthSection({ healthCenters }: Props) {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredCenters = healthCenters.filter(h => {
    if (filterType === 'all') return true;
    return h.type === filterType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Red Hospitalaria y Triage de Urgencias — Cali</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Puntos de Atención Médica y Hospitales en Alerta
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base mt-2 leading-relaxed">
            Consulte la capacidad de los centros hospitalarios, puestos médicos avanzados de campaña y puestos de donación de sangre de la Cruz Roja y el Hemocentro del Valle.
          </p>
        </div>
      </div>

      {/* Blood Donation Urgent Callout */}
      <div className="bg-rose-600 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-rose-500 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-amber-300" />
              <span>Llamado Urgente a Donantes de Sangre</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Se requieren con urgencia unidades de sangre O-, O+ y A+ en Cali
            </h3>
            <p className="text-white/90 text-xs sm:text-sm max-w-2xl">
              Los heridos por colapso estructural en HUV y San Juan de Dios requieren transfusiones inmediatas. Puntos de donación activos 24h en la <strong>Cruz Roja Seccional Valle (Cra 38 Bis # 5-91)</strong> y <strong>Hemocentro HUV (Calle 5ta)</strong>.
            </p>
          </div>

          <a
            href="tel:6025184200"
            className="shrink-0 bg-white text-rose-700 hover:bg-rose-50 font-black px-5 py-3 rounded-xl text-sm shadow-md transition"
          >
            Llamar a Banco de Sangre (132)
          </a>
        </div>
      </div>

      {/* Type Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos los centros médicos
          </button>
          <button
            onClick={() => setFilterType('hospital')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'hospital'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Hospitales de Nivel II y III
          </button>
          <button
            onClick={() => setFilterType('campana')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'campana'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            Puestos Avanzados de Campaña
          </button>
          <button
            onClick={() => setFilterType('caps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'caps'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Centros de Salud (CAPS)
          </button>
        </div>
      </div>

      {/* Health Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map(center => {
          const isCritical = center.urgencyStatus === 'critical';
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.long}`;

          return (
            <div
              key={center.id}
              className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                isCritical ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      {center.comuna} • {center.type === 'hospital' ? 'Hospital' : center.type === 'campana' ? 'Puesto de Campaña' : 'Centro CAPS'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {center.name}
                    </h3>
                  </div>

                  {center.open24h && (
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                      24 HORAS
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{center.address}</span>
                  </div>
                  {center.triageWaitTime && (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{center.triageWaitTime}</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Servicios de Urgencia Habilitados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {center.specialties.map((sp, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Blood needed */}
                {center.bloodUrgency && center.bloodUrgency.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-900 p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-rose-600" />
                      Tipos de sangre requeridos:
                    </span>
                    <div className="flex gap-1">
                      {center.bloodUrgency.map(t => (
                        <span key={t} className="bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
                <a
                  href={`tel:${center.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{center.phone}</span>
                </a>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Cómo Llegar</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
