import { useState } from 'react';
import { X, UserPlus, Send } from 'lucide-react';
import type { MissingPerson } from '@/domain/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (person: Omit<MissingPerson, 'id' | 'reportedAt'>) => void;
}

export default function ReportMissingModal({ isOpen, onClose, onSubmit }: Props) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'M' | 'F' | 'Otro'>('M');
  const [idDocument, setIdDocument] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [comuna, setComuna] = useState('Comuna 20 (Siloé)');
  const [lastSeenDate] = useState('Hoy');
  const [description, setDescription] = useState('');
  const [clothing, setClothing] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !age || !lastSeenLocation || !description || !contactName || !contactPhone) {
      alert('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    onSubmit({
      fullName,
      age: Number(age),
      gender,
      idDocument: idDocument || undefined,
      status: 'searching',
      lastSeenLocation,
      comuna,
      lastSeenDate,
      description,
      clothing: clothing || 'No especificada',
      medicalNeeds: medicalNeeds || undefined,
      contactName,
      contactPhone,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Reportar Familiar o Persona Desaparecida</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <p className="text-slate-500 text-xs">
            Esta información se publicará en la base de datos comunitaria de EmerRed Cali para facilitar su identificación en albergues y centros asistenciales.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ej. Mateo Valencia Arango"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Edad *</label>
              <input
                type="number"
                required
                min="0"
                max="120"
                value={age}
                onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Ej. 28"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Género</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as 'M' | 'F' | 'Otro')}
                className="w-full p-2.5 border rounded-lg bg-white"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro / Prefiero no decir</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Documento / Cédula (Opcional)</label>
              <input
                type="text"
                value={idDocument}
                onChange={e => setIdDocument(e.target.value)}
                placeholder="Ej. 1.144.520.***"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Comuna o Sector en Cali *</label>
              <input
                type="text"
                required
                value={comuna}
                onChange={e => setComuna(e.target.value)}
                placeholder="Ej. Comuna 20 (Siloé) o Comuna 1 (Terrón)"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Última ubicación vista *</label>
              <input
                type="text"
                required
                value={lastSeenLocation}
                onChange={e => setLastSeenLocation(e.target.value)}
                placeholder="Ej. Sector La Estrella cerca a la iglesia"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rasgos Físicos Particulares (Tatuajes, cicatrices, estatura, cabello) *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej. Estatura 1.75m, tez morena, cicatriz en la ceja izquierda..."
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vestimenta al momento de ser visto</label>
            <input
              type="text"
              value={clothing}
              onChange={e => setClothing(e.target.value)}
              placeholder="Ej. Camiseta negra, jean azul, tenis grises..."
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Condición Médica Especial / Medicamentos Vitales</label>
            <input
              type="text"
              value={medicalNeeds}
              onChange={e => setMedicalNeeds(e.target.value)}
              placeholder="Ej. Asmático, requiere inhalador / Diabético con insulina"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 block">Datos del Familiar que Reporta *</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Nombre y Parentesco *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Ej. Claudia Arango (Madre)"
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Teléfono de Contacto *</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="Ej. 315 789 4521"
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Reporte</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
