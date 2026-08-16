import { useState } from 'react';
import {
  Home,
  MapPin,
  Phone,
  ExternalLink,
  Shield,
} from 'lucide-react';
import type { Shelter } from '@/domain/types';

interface Props {
  shelters: Shelter[];
  onNavigateToMap?: (shelterId: string) => void;
}

export default function SheltersSection({ shelters }: Props) {
  const [selectedComuna, setSelectedComuna] = useState<string>('all');
  const [filterPetsOnly, setFilterPetsOnly] = useState(false);

  const comunas = Array.from(new Set(shelters.map(s => s.comuna)));

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalAvailable = totalCapacity - totalOccupied;

  const filteredShelters = shelters.filter(s => {
    const matchComuna = selectedComuna === 'all' || s.comuna === selectedComuna;
    const matchPets = !filterPetsOnly || s.services.some(srv => srv.toLowerCase().includes('mascotas'));
    return matchComuna && matchPets;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Home className="w-3.5 h-3.5" />
            <span>Red de Albergues y Alojamientos de Emergencia Cali</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Albergues Temporales y Refugios Seguros
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mt-2 leading-relaxed">
            Consulte la disponibilidad de cupos en tiempo real, servicios sanitarios, alimentación caliente y puntos de atención médica en los refugios habilitados por la Alcaldía de Cali y la Defensa Civil.
          </p>
        </div>
      </div>

      {/* Global Capacity Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Capacidad Total Habilitada</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{totalCapacity} Plazas</div>
          <span className="text-xs text-slate-500">En 6 albergues oficiales</span>
        </div>

        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 shadow-sm">
          <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">Personas Alojadas</span>
          <div className="text-3xl font-black text-amber-700 mt-1">{totalOccupied}</div>
          <span className="text-xs text-amber-700">({Math.round((totalOccupied / totalCapacity) * 100)}% ocupación)</span>
        </div>

        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 shadow-sm">
          <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Cupos Disponibles</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{totalAvailable} Plazas</div>
          <span className="text-xs text-emerald-600">Disponibles de inmediato</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedComuna}
            onChange={e => setSelectedComuna(e.target.value)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="all">Todas las Comunas</option>
            {comunas.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterPetsOnly}
              onChange={e => setFilterPetsOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span>🐾 Solo que admitan Mascotas (Pet-Friendly)</span>
          </label>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Mostrando {filteredShelters.length} albergues
        </span>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShelters.map(shelter => {
          const occupancyRate = Math.round((shelter.occupied / shelter.capacity) * 100);
          const isNearCapacity = occupancyRate >= 80;
          const isFull = occupancyRate >= 98;
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.long}`;

          return (
            <div
              key={shelter.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      {shelter.comuna}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {shelter.name}
                    </h3>
                  </div>

                  {isFull ? (
                    <span className="bg-red-100 text-red-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0">
                      Completo
                    </span>
                  ) : isNearCapacity ? (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0">
                      Pocos Cupos
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0">
                      Cupos Disponibles
                    </span>
                  )}
                </div>

                {/* Occupancy Progress Bar */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">Ocupación Actual:</span>
                    <span className="text-slate-900 font-bold">
                      {shelter.occupied} / {shelter.capacity} plazas ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? 'bg-red-600' : isNearCapacity ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Location & Entity */}
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{shelter.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Coordina: <strong className="text-slate-700">{shelter.manager}</strong></span>
                  </div>
                </div>

                {/* Services List */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Servicios e Instalaciones:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {shelter.services.map((srv, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-900 text-[11px] font-medium px-2 py-0.5 rounded-md border border-blue-100"
                      >
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {shelter.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                    Nota: {shelter.notes}
                  </p>
                )}
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
                <a
                  href={`tel:${shelter.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{shelter.phone}</span>
                </a>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Cómo Llegar</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules for Shelters */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Recomendaciones al Ingresar a un Albergue Temporal</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <strong className="block text-slate-900 text-sm mb-1">1. Registro Familiar</strong>
            Presente su documento de identidad y el de sus acompañantes ante el equipo de la Defensa Civil o Cruz Roja en la entrada para quedar censados en la base de datos oficial.
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <strong className="block text-slate-900 text-sm mb-1">2. Triage Médico</strong>
            Si usted o algún familiar tiene heridas, enfermedades crónicas (diabetes, asma, hipertensión) o requiere medicamentos, notifíquelo de inmediato en el módulo de enfermería.
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <strong className="block text-slate-900 text-sm mb-1">3. Mascotas y Convivencia</strong>
            Mantenga a sus mascotas con collar y correa. Respete los horarios de descanso, áreas asignadas y colabore con el aseo de las zonas comunes.
          </div>
        </div>
      </div>
    </div>
  );
}
