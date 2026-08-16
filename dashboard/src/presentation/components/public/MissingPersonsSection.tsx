import { useState } from 'react';
import {
  Search,
  UserPlus,
  MapPin,
  Phone,
  Share2,
  AlertCircle,
  CheckCircle,
  Activity,
  Home,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { MissingPerson, MissingPersonStatus } from '@/domain/types';

interface Props {
  missingPersons: MissingPerson[];
  onOpenReportMissingModal: () => void;
  onOpenReportSafeModal: () => void;
  onUpdateStatus: (id: string, status: MissingPersonStatus, note?: string) => void;
}

const STATUS_CONFIG: Record<
  MissingPersonStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  searching: {
    label: 'Búsqueda Activa',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: AlertCircle,
  },
  shelter: {
    label: 'En Albergue',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: Home,
  },
  medical: {
    label: 'En Centro Médico',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: Activity,
  },
  safe: {
    label: 'Reportado a Salvo',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: CheckCircle,
  },
};

export default function MissingPersonsSection({
  missingPersons,
  onOpenReportMissingModal,
  onOpenReportSafeModal,
  onUpdateStatus,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedComuna, setSelectedComuna] = useState<string>('all');
  const [updatingPersonId, setUpdatingPersonId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');

  // Stats calculation
  const totalCount = missingPersons.length;
  const searchingCount = missingPersons.filter(p => p.status === 'searching').length;
  const safeCount = missingPersons.filter(p => p.status === 'safe' || p.status === 'shelter').length;
  const medicalCount = missingPersons.filter(p => p.status === 'medical').length;

  const comunas = Array.from(new Set(missingPersons.map(p => p.comuna))).filter(Boolean);

  const filteredPersons = missingPersons.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.fullName.toLowerCase().includes(q) ||
      (p.idDocument && p.idDocument.toLowerCase().includes(q)) ||
      p.lastSeenLocation.toLowerCase().includes(q) ||
      p.comuna.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.clothing.toLowerCase().includes(q);

    const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchComuna = selectedComuna === 'all' || p.comuna === selectedComuna;

    return matchSearch && matchStatus && matchComuna;
  });

  function sharePerson(p: MissingPerson) {
    const statusText = STATUS_CONFIG[p.status].label;
    const text = `🚨 *EmerRed Cali — Reporte de Persona:* ${p.fullName} (${p.age} años)\n📍 *Última ubicación vista:* ${p.lastSeenLocation} (${p.comuna})\n🏷️ *Estado:* ${statusText}\n👕 *Ropa:* ${p.clothing}\n🔍 *Rasgos:* ${p.description}\n📞 *Contacto familiar:* ${p.contactName} (${p.contactPhone})\n\n_Por favor difunda para ayudar a su localización._`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  function handleSaveStatus(id: string, newStatus: MissingPersonStatus) {
    onUpdateStatus(id, newStatus, statusNote || undefined);
    setUpdatingPersonId(null);
    setStatusNote('');
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Censo y Localización de Personas — Terremoto Cali</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Búsqueda y Reporte de Personas Desaparecidas
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Plataforma pública y comunitaria para reportar familiares que no han podido ser contactados, verificar registros en albergues y centros asistenciales de Cali, o reportarse a salvo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenReportMissingModal}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Reportar Familiar Desaparecido</span>
            </button>

            <button
              onClick={onOpenReportSafeModal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Estoy Bien / Reportarme a Salvo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Situation Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Registrados</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-400">En base de datos</span>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200 shadow-sm">
          <span className="text-xs text-red-700 font-bold uppercase tracking-wider">Búsqueda Activa</span>
          <div className="text-2xl font-black text-red-600 mt-1">{searchingCount}</div>
          <span className="text-[11px] text-red-600/80">Por localizar</span>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">A Salvo / Albergue</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{safeCount}</div>
          <span className="text-[11px] text-emerald-600/80">Ubicados con éxito</span>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm">
          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">En Salud / Triaje</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{medicalCount}</div>
          <span className="text-[11px] text-amber-600/80">En hospitales HUV/Red</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre completo, documento, barrio, ropa o señas..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div>
            <select
              value={selectedComuna}
              onChange={e => setSelectedComuna(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition text-slate-700"
            >
              <option value="all">Todas las Comunas / Sectores</option>
              {comunas.map(com => (
                <option key={com} value={com}>
                  {com}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStatus === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos los estados ({missingPersons.length})
          </button>
          <button
            onClick={() => setSelectedStatus('searching')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStatus === 'searching'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Búsqueda Activa ({searchingCount})</span>
          </button>
          <button
            onClick={() => setSelectedStatus('shelter')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStatus === 'shelter'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Home className="w-3 h-3" />
            <span>En Albergue</span>
          </button>
          <button
            onClick={() => setSelectedStatus('medical')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStatus === 'medical'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>En Atención Médica ({medicalCount})</span>
          </button>
          <button
            onClick={() => setSelectedStatus('safe')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStatus === 'safe'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Reportado a Salvo</span>
          </button>
        </div>
      </div>

      {/* Persons Cards Grid */}
      {filteredPersons.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-slate-700">No se encontraron registros</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            No hay reportes que coincidan con la búsqueda. Si su familiar no está en la lista, puede ingresarlo de inmediato.
          </p>
          <button
            onClick={onOpenReportMissingModal}
            className="mt-4 inline-flex items-center gap-2 bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow hover:bg-rose-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ingresar Nuevo Reporte</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersons.map(person => {
            const statusCfg = STATUS_CONFIG[person.status];
            const StatusIcon = statusCfg.icon;
            const initials = person.fullName
              .split(' ')
              .map(n => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const isUpdating = updatingPersonId === person.id;

            return (
              <div
                key={person.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  person.status === 'searching'
                    ? 'border-red-200 ring-1 ring-red-50'
                    : person.status === 'safe'
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-5">
                  {/* Card Header with Avatar & Status */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 ${
                        person.status === 'searching'
                          ? 'bg-red-600 text-white'
                          : person.status === 'safe'
                          ? 'bg-emerald-600 text-white'
                          : person.status === 'medical'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusCfg.label}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {person.reportedAt.split(' ')[0]}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 truncate" title={person.fullName}>
                        {person.fullName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {person.age} años {person.gender && `• ${person.gender === 'M' ? 'Masculino' : person.gender === 'F' ? 'Femenino' : 'Otro'}`}
                        {person.idDocument && ` • CC ${person.idDocument}`}
                      </p>
                    </div>
                  </div>

                  {/* Location & Details */}
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">Última ubicación:</span>
                        <p className="text-slate-700">{person.lastSeenLocation}</p>
                        <span className="text-[11px] font-medium text-slate-500">{person.comuna}</span>
                      </div>
                    </div>

                    <div>
                      <strong className="text-slate-700">Vestimenta:</strong>{' '}
                      <span>{person.clothing}</span>
                    </div>

                    <div>
                      <strong className="text-slate-700">Rasgos particulares:</strong>{' '}
                      <span>{person.description}</span>
                    </div>

                    {person.medicalNeeds && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-lg text-[11px] font-medium flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Atención Médica:</strong> {person.medicalNeeds}</span>
                      </div>
                    )}

                    {person.currentShelterOrHospital && (
                      <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-lg text-[11px] font-medium flex items-start gap-1.5">
                        <Home className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{person.currentShelterOrHospital}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contacto Familiar / Reportante:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-semibold text-slate-800">{person.contactName}</span>
                      <a
                        href={`tel:${person.contactPhone.replace(/\D/g, '')}`}
                        className="flex items-center gap-1 text-rose-600 font-bold hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{person.contactPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Updating Status Form in Card */}
                {isUpdating ? (
                  <div className="p-4 bg-slate-100 border-t border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-800">Actualizar estado de esta persona:</p>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="Nota (ej. Ubicado en Albergue El Guabal, en buen estado)"
                      className="w-full p-2 text-xs border rounded-lg bg-white"
                    />
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handleSaveStatus(person.id, 'safe')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 rounded-lg"
                      >
                        A Salvo
                      </button>
                      <button
                        onClick={() => handleSaveStatus(person.id, 'shelter')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 rounded-lg"
                      >
                        En Albergue
                      </button>
                      <button
                        onClick={() => handleSaveStatus(person.id, 'medical')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1.5 rounded-lg"
                      >
                        En Hospital
                      </button>
                      <button
                        onClick={() => setUpdatingPersonId(null)}
                        className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold text-xs py-1.5 rounded-lg"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Footer */
                  <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setUpdatingPersonId(person.id)}
                      className="text-xs font-bold text-slate-700 hover:text-rose-600 transition"
                    >
                      Actualizar Estado
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => sharePerson(person)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                        title="Compartir por WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
