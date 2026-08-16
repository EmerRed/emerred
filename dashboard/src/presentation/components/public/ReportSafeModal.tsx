import { useState } from 'react';
import { X, ShieldCheck, Send } from 'lucide-react';
import type { MissingPerson } from '@/domain/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (person: Omit<MissingPerson, 'id' | 'reportedAt'>) => void;
}

export default function ReportSafeModal({ isOpen, onClose, onSubmit }: Props) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [idDocument, setIdDocument] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [comuna, setComuna] = useState('Comuna 19 (San Fernando)');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Me encuentro a salvo y en buen estado de salud.');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !currentLocation || !phone) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    onSubmit({
      fullName,
      age: Number(age) || 30,
      gender: 'Otro',
      idDocument: idDocument || undefined,
      status: 'safe',
      lastSeenLocation: currentLocation,
      comuna,
      lastSeenDate: 'Hoy',
      description: 'Reporte directo del ciudadano: ' + message,
      clothing: 'N/A',
      contactName: fullName + ' (Personal)',
      contactPhone: phone,
      currentShelterOrHospital: `Reportado a salvo en: ${currentLocation}`,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
            <h3 className="text-base font-bold">Reportarme A Salvo (Estoy Bien)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            Diligencie este formulario para actualizar el censo de emergencia y confirmar a sus familiares y organismos de socorro que se encuentra en un lugar seguro.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ej. Valeria Rivas Mosquera"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Edad</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Ej. 24"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cédula / Documento</label>
              <input
                type="text"
                value={idDocument}
                onChange={e => setIdDocument(e.target.value)}
                placeholder="Ej. 1.118.***"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Comuna o Sector Actual *</label>
              <input
                type="text"
                required
                value={comuna}
                onChange={e => setComuna(e.target.value)}
                placeholder="Ej. Comuna 22 (Ciudad Jardín)"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono Móvil Activo *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ej. 310 998 1234"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ubicación o Lugar Seguro Actual *</label>
            <input
              type="text"
              required
              value={currentLocation}
              onChange={e => setCurrentLocation(e.target.value)}
              placeholder="Ej. En casa de familiares en el barrio Ciudad Jardín"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mensaje para Familiares</label>
            <textarea
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs resize-none"
            />
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar que Estoy a Salvo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
