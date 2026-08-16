import { useState } from 'react';
import {
  Droplets,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { WaterDistributionPoint } from '@/domain/types';
import { UTILITIES_STATUS } from '@/data/caliEmergencyData';

interface Props {
  waterPoints: WaterDistributionPoint[];
}

export default function UtilitiesSection({ waterPoints }: Props) {
  const [selectedComuna, setSelectedComuna] = useState<string>('all');

  const filteredWaterPoints = waterPoints.filter(w => {
    if (selectedComuna === 'all') return true;
    return w.comuna === selectedComuna;
  });

  const comunas = Array.from(new Set(waterPoints.map(w => w.comuna)));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-teal-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Droplets className="w-3.5 h-3.5" />
            <span>Monitoreo de Infraestructura y Servicios Públicos Cali</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Estado de Servicios Básicos y Rutas de Agua
          </h2>
          <p className="text-cyan-100 text-sm sm:text-base mt-2 leading-relaxed">
            Consulte la programación y ubicación en tiempo real de los carrotanques de agua potable de Emcali, el estado del suministro eléctrico, gas natural y las vías principales transitables en la ciudad.
          </p>
        </div>
      </div>

      {/* Utilities Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {UTILITIES_STATUS.map((u, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-base">{u.service}</h3>
                <span className={`text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full ${u.badgeColor}`}>
                  {u.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">{u.description}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Recomendación a la ciudadanía:</strong> {u.actionAdvice}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Water Distribution (Carrotanques) Schedule */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Droplets className="w-6 h-6 text-cyan-600" />
              <span>Programación de Carrotanques de Agua Potable (Emcali)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Traiga recipientes limpios con tapa. Prioridad en la fila para madres gestantes y adultos mayores.
            </p>
          </div>

          <select
            value={selectedComuna}
            onChange={e => setSelectedComuna(e.target.value)}
            className="px-3.5 py-2 border rounded-xl text-xs font-semibold text-slate-700 bg-slate-50"
          >
            <option value="all">Todas las Comunas</option>
            {comunas.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWaterPoints.map(point => {
            const isArrived = point.status === 'arrived';
            const isEnRoute = point.status === 'en_route';

            return (
              <div
                key={point.id}
                className={`p-4 rounded-xl border transition-all ${
                  isArrived
                    ? 'border-cyan-400 bg-cyan-50/50'
                    : isEnRoute
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{point.comuna}</span>
                  {isArrived ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                      En el Sitio
                    </span>
                  ) : isEnRoute ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      En Ruta
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Programado
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">{point.location}</h4>

                <div className="space-y-1 text-xs text-slate-600 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{point.schedule}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Vehículo: {point.vehiclePlate} ({point.litersEstimated.toLocaleString()} L)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
