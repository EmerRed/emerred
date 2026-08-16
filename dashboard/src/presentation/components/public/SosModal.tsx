import { useState } from 'react';
import { X, ShieldAlert, Send, Compass } from 'lucide-react';
import type { PublicSosReport, SosUrgencyType } from '@/domain/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<PublicSosReport, 'id' | 'timestamp' | 'status' | 'radicado'>) => Promise<PublicSosReport>;
}

export default function SosModal({ isOpen, onClose, onSubmit }: Props) {
  const [urgencyType, setUrgencyType] = useState<SosUrgencyType>('rescue');
  const [reporterName, setReporterName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comuna] = useState('Comuna 20 (Siloé)');
  const [description, setDescription] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [hasChildrenOrElderly, setHasChildrenOrElderly] = useState(false);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [long, setLong] = useState<number | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successRadicado, setSuccessRadicado] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleGetGps() {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada.');
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
      () => {
        setGpsLoading(false);
        alert('No se pudo obtener la ubicación GPS automática.');
      },
      { timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reporterName || !phone || !address || !description) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmit({
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

      setSuccessRadicado(res.radicado);
    } catch {
      alert('Error enviando la alerta. Llame inmediatamente al 119 o 123.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-red-300 my-auto">
        <div className="p-5 border-b border-red-800 flex items-center justify-between bg-red-700 text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-300 animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold">EMISIÓN DE ALERTA SOS PRIORITARIA</h3>
              <p className="text-[11px] text-red-100">Despacho de Rescate y Auxilio Ciudadano — Cali</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successRadicado ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
              🚨
            </div>
            <h4 className="text-xl font-black text-slate-900">¡Alerta SOS Transmitida!</h4>
            <div className="bg-slate-100 p-3 rounded-xl font-mono text-sm font-bold text-red-600">
              Radicado: {successRadicado}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              La señal ha ingresado a la central de despacho de Bomberos Cali, Cruz Roja y Defensa Civil. Mantenga su línea telefónica libre y despejada.
            </p>
            <button
              onClick={() => {
                setSuccessRadicado(null);
                onClose();
              }}
              className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
            >
              Entendido / Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Urgencia *</label>
              <select
                value={urgencyType}
                onChange={e => setUrgencyType(e.target.value as SosUrgencyType)}
                className="w-full p-2.5 border rounded-lg bg-white font-semibold text-red-700 focus:ring-2 focus:ring-red-500"
              >
                <option value="rescue">🚨 Rescate / Personas Atrapadas</option>
                <option value="medical">🩺 Atención Médica Urgente (Heridos graves)</option>
                <option value="collapse">🏚️ Colapso de Vivienda / Peligro Inminente</option>
                <option value="supplies">🥫 Familiares Aislados sin Agua / Comida</option>
                <option value="vulnerable">👶 Bebés o Adultos Mayores en Peligro</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Solicitante *</label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Ej. Andrés Morales"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Celular de Contacto *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej. 315 889 4433"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Ubicación en Cali *</span>
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={gpsLoading}
                  className="text-[11px] font-bold text-red-600 bg-white border border-red-200 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" />
                  <span>{gpsLoading ? 'GPS...' : gpsSuccess ? '✓ GPS Ok' : 'Detectar GPS'}</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Dirección exacta o punto de referencia en Cali"
                className="w-full p-2 border rounded-lg bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Descripción de la Situación *</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Indique qué ocurrió y si hay heridos..."
                className="w-full p-2 border rounded-lg text-xs resize-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChildrenOrElderly}
                  onChange={e => setHasChildrenOrElderly(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span>Hay niños o ancianos</span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Personas:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={peopleCount}
                  onChange={e => setPeopleCount(parseInt(e.target.value) || 1)}
                  className="w-14 p-1 border rounded text-center font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition flex items-center gap-1.5 shadow-md shadow-red-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitiendo...' : 'ENVIAR SOS'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
