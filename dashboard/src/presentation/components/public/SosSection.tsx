import { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Compass,
  Send,
  Radio,
  Share2,
} from 'lucide-react';
import type { PublicSosReport, SosUrgencyType } from '@/domain/types';

interface Props {
  sosReports: PublicSosReport[];
  onCreateSos: (report: Omit<PublicSosReport, 'id' | 'timestamp' | 'status' | 'radicado'>) => Promise<PublicSosReport>;
}

const URGENCY_TYPES: Record<SosUrgencyType, { label: string; icon: string; color: string; desc: string }> = {
  rescue: {
    label: 'Rescate / Personas Atrapadas',
    icon: '🚨',
    color: 'border-red-500 bg-red-50 text-red-900',
    desc: 'Personas bajo escombros o atrapadas en edificaciones dañadas',
  },
  medical: {
    label: 'Atención Médica Prioritaria',
    icon: '🩺',
    color: 'border-amber-500 bg-amber-50 text-amber-900',
    desc: 'Heridos de gravedad, fracturas, hemorragias o crisis respiratoria',
  },
  collapse: {
    label: 'Vivienda a Punto de Colapsar',
    icon: '🏚️',
    color: 'border-orange-500 bg-orange-50 text-orange-900',
    desc: 'Grietas severas en columnas, muros inclinados, peligro inminente',
  },
  supplies: {
    label: 'Víveres y Agua para Aislados',
    icon: '🥫',
    color: 'border-blue-500 bg-blue-50 text-blue-900',
    desc: 'Comunidad sin acceso a agua potable o alimentos básicos',
  },
  vulnerable: {
    label: 'Adulto Mayor / Lactantes en Riesgo',
    icon: '👶',
    color: 'border-purple-500 bg-purple-50 text-purple-900',
    desc: 'Bebés recién nacidos, ancianos sin movilidad o medicación vital',
  },
};

export default function SosSection({ sosReports, onCreateSos }: Props) {
  const [urgencyType, setUrgencyType] = useState<SosUrgencyType>('rescue');
  const [reporterName, setReporterName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comuna, setComuna] = useState('Comuna 20 (Siloé)');
  const [description, setDescription] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [hasChildrenOrElderly, setHasChildrenOrElderly] = useState(false);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [long, setLong] = useState<number | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastCreatedSos, setLastCreatedSos] = useState<PublicSosReport | null>(null);

  const COMUNAS_CALI = [
    'Comuna 1 (Terrón Colorado / Vía al Mar)',
    'Comuna 2 (Santa Mónica / Granada / VIPASA)',
    'Comuna 3 (San Antonio / El Peñón / Centro)',
    'Comuna 4 (Salomia / Santander)',
    'Comuna 5 (Los Andes / Chiminangos)',
    'Comuna 6 (San Luis / Los Alcázares)',
    'Comuna 7 (Alfonso López)',
    'Comuna 8 (Las Américas / Chapinero)',
    'Comuna 9 (Alameda / San Pascual / Junín)',
    'Comuna 10 (El Guabal / Santa Elena)',
    'Comuna 11 (El Prado / 20 de Julio)',
    'Comuna 12 (El Trébol / Villanueva)',
    'Comuna 13 (El Diamante / El Vergel)',
    'Comuna 14 (Los Naranjos / Manuela Beltrán)',
    'Comuna 15 (Morichal / El Vallado)',
    'Comuna 16 (Mariano Ramos / República de Israel)',
    'Comuna 17 (El Ingenio / Capri / Limonar)',
    'Comuna 18 (Meléndez / Polvorines / Los Chorros)',
    'Comuna 19 (San Fernando / Tequendama / Miraflores)',
    'Comuna 20 (Siloé / La Sultana / Belén)',
    'Comuna 21 (Decepaz / Desepaz)',
    'Comuna 22 (Ciudad Jardín / Pance)',
    'Corregimientos (La Buitrera, Montebello, Pichindé, etc.)',
  ];

  function handleGetGps() {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por su navegador.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude);
        setLong(pos.coords.longitude);
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      err => {
        console.warn('GPS Error', err);
        setGpsLoading(false);
        alert('No se pudo obtener la ubicación GPS automática. Por favor ingrese la dirección y comuna manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reporterName || !phone || !address || !description) {
      alert('Por favor complete los campos obligatorios para procesar el auxilio.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await onCreateSos({
        reporterName,
        phone,
        urgencyType,
        description,
        peopleCount: Number(peopleCount) || 1,
        hasChildrenOrElderly,
        address,
        comuna,
        lat: lat || 3.42,
        long: long || -76.54,
      });

      setLastCreatedSos(created);
      // Reset form
      setReporterName('');
      setPhone('');
      setAddress('');
      setDescription('');
      setPeopleCount(1);
      setHasChildrenOrElderly(false);
      setGpsSuccess(false);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar el reporte. Por favor intente nuevamente o llame al 119/123.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span>Despacho de Auxilio Ciudadano — EmerRed PMU Cali</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Solicitud de Ayuda Inmediata (Botón SOS)
          </h2>
          <p className="text-white/95 text-sm sm:text-base mt-2 leading-relaxed">
            Si usted o sus vecinos se encuentran atrapados, lesionados o incomunicados en cualquier barrio o corregimiento de Cali, envíe este reporte. La señal se transmite directamente al Puesto de Mando Unificado (PMU) y brigadas de rescate.
          </p>
        </div>
      </div>

      {/* Success Confirmation Radicado Card */}
      {lastCreatedSos && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 shadow-md animate-bounce-once">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                ¡SOLICITUD SOS REGISTRADA EXITOSAMENTE!
              </span>
              <h3 className="text-xl font-extrabold text-emerald-950 mt-0.5">
                Código de Radicado: <span className="font-mono text-emerald-700">{lastCreatedSos.radicado}</span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900 mt-1">
                Su solicitud ha sido priorizada en el sistema de despacho de los Bomberos de Cali y Defensa Civil. Guarde este código para seguimiento en las líneas de emergencia.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const text = `🚨 *Reporte SOS Radicado:* ${lastCreatedSos.radicado}\n📍 *Ubicación:* ${lastCreatedSos.address} (${lastCreatedSos.comuna})\n👥 *Personas:* ${lastCreatedSos.peopleCount}\n📋 *Detalle:* ${lastCreatedSos.description}\n_Enviado vía EmerRed Cali_`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition inline-flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir Radicado a Familiares por WhatsApp</span>
                </button>
                <button
                  onClick={() => setLastCreatedSos(null)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs px-3.5 py-2 rounded-lg transition"
                >
                  Cerrar Aviso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form and Active SOS Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOS Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>Formulario de Auxilio Prioritario</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Por favor diligencie la información con la mayor precisión posible para orientar a los rescatistas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Urgency Type Radio Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tipo de Urgencia Principal *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(URGENCY_TYPES) as SosUrgencyType[]).map(typeKey => {
                  const info = URGENCY_TYPES[typeKey];
                  const isSelected = urgencyType === typeKey;
                  return (
                    <button
                      type="button"
                      key={typeKey}
                      onClick={() => setUrgencyType(typeKey)}
                      className={`p-3 rounded-xl border-2 text-left transition flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-red-600 bg-red-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xl shrink-0">{info.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">{info.label}</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{info.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GPS & Location */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Ubicación Exacta en Cali *</span>
                </span>
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={gpsLoading}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-white border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                >
                  <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsLoading ? 'Detectando GPS...' : gpsSuccess ? '✓ GPS Capturado' : '📍 Usar mi GPS'}</span>
                </button>
              </div>

              {gpsSuccess && lat && long && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-mono font-medium">
                  Coordenadas GPS: {lat.toFixed(5)}, {long.toFixed(5)}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Comuna o Sector</label>
                  <select
                    value={comuna}
                    onChange={e => setComuna(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-red-500"
                  >
                    {COMUNAS_CALI.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección o Puntos de Referencia *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ej. Calle 2 Oeste # 50-12, frente a la tienda La Estrella"
                    className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Reporter Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Persona que Reporta *
                </label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Ej. Carlos Andrés Gómez"
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono Celular de Contacto *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej. 315 123 4567"
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* People affected and vulnerability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Personas Afectadas
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={peopleCount}
                  onChange={e => setPeopleCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasChildrenOrElderly}
                    onChange={e => setHasChildrenOrElderly(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span>Hay niños, bebés o adultos mayores</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detalle de la Emergencia y Estado de las Personas *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describa la situación: si hay personas con heridas visibles, si hay olor a gas, si la salida está bloqueada por escombros, etc."
                className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Emitiendo señal de auxilio...' : 'ENVIAR SOLICITUD DE AUXILIO SOS AHORA'}</span>
            </button>
          </form>
        </div>

        {/* Active Emergency Board */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span>Tablero de Despacho Comunitario</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {sosReports.length} Activas
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Últimos radicados recibidos en la ciudad de Cali y estado de atención por brigadistas:
            </p>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {sosReports.map(report => {
                const urgencyInfo = URGENCY_TYPES[report.urgencyType] || { label: report.urgencyType, icon: '🚨' };
                const isDispatched = report.status === 'dispatched';
                const isAttended = report.status === 'attended';

                return (
                  <div
                    key={report.id}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-300 font-bold text-[11px]">
                        {report.radicado}
                      </span>
                      {isAttended ? (
                        <span className="bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          ✓ Atendido
                        </span>
                      ) : isDispatched ? (
                        <span className="bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                          Brigada Despachada
                        </span>
                      ) : (
                        <span className="bg-red-900/80 text-red-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                          En Triage
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{urgencyInfo.icon}</span>
                      <span>{urgencyInfo.label}</span>
                    </div>

                    <p className="text-slate-300 text-[11px] line-clamp-2">
                      {report.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
                      <span>📍 {report.comuna}</span>
                      <span>👥 {report.peopleCount} personas</span>
                      <span>🕒 {report.timestamp.split(' ')[1] || report.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
