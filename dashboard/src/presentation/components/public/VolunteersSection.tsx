import { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Send,
  UserPlus,
} from 'lucide-react';
import type { VolunteerApplication } from '@/domain/types';

interface Props {
  volunteers?: VolunteerApplication[];
  onRegisterVolunteer: (vol: Omit<VolunteerApplication, 'id' | 'registeredAt'>) => void;
}

export default function VolunteersSection({ onRegisterVolunteer }: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [category, setCategory] = useState<VolunteerApplication['category']>('salud');
  const [availability, setAvailability] = useState('Tiempo Completo');
  const [comuna, setComuna] = useState('Comuna 19 (San Fernando)');
  const [hasVehicle, setHasVehicle] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone || !profession) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    onRegisterVolunteer({
      fullName,
      phone,
      email,
      profession,
      category,
      availability,
      comuna,
      hasVehicle,
    });

    setRegisteredSuccess(true);
    setFullName('');
    setPhone('');
    setEmail('');
    setProfession('');
    setHasVehicle(false);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Brigada Ciudadana de Apoyo Humanitario — Cali</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Convocatoria e Inscripción de Voluntarios
          </h2>
          <p className="text-purple-100 text-sm sm:text-base mt-2 leading-relaxed">
            Inscríbase para apoyar en puestos de salud, clasificación de donaciones en el Coliseo del Pueblo, apoyo psicosocial en albergues o transporte de víveres en camionetas 4x4.
          </p>
        </div>
      </div>

      {registeredSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-emerald-950">
              ¡Inscripción de Voluntario Registrada con Éxito!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-900 mt-1">
              Los coordinadores de la Cruz Roja Seccional Valle y Defensa Civil se pondrán en contacto a su número de celular según las necesidades prioritarias del día. ¡Muchas gracias por su solidaridad!
            </p>
            <button
              onClick={() => setRegisteredSuccess(false)}
              className="mt-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-purple-600" />
            <span>Formulario de Inscripción Voluntaria</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Diligencie sus datos y área de especialidad para ser asignado a la brigada correspondiente.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ej. Dra. Laura Castillo"
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej. 318 456 7890"
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profesión u Oficio *</label>
                <input
                  type="text"
                  required
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  placeholder="Ej. Enfermero, Psicólogo, Conductor, Estudiante"
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Área de Apoyo Principal *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as VolunteerApplication['category'])}
                  className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="salud">🩺 Salud (Médico / Enfermería / Triage)</option>
                  <option value="psicologia">🧠 Psicología y Apoyo Emocional</option>
                  <option value="rescate">🧗 Rescate y Remoción de Escombros</option>
                  <option value="logistica">📦 Logística y Clasificación de Víveres</option>
                  <option value="transporte">🚙 Transporte (Camioneta / Flete)</option>
                  <option value="albergue">⛺ Apoyo General en Albergues</option>
                  <option value="veterinaria">🐾 Veterinaria y Rescate Animal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disponibilidad Horaria</label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Tiempo Completo">Tiempo Completo</option>
                  <option value="Turno Mañana (07:00 AM - 01:00 PM)">Turno Mañana (07:00 AM - 01:00 PM)</option>
                  <option value="Turno Tarde (01:00 PM - 07:00 PM)">Turno Tarde (01:00 PM - 07:00 PM)</option>
                  <option value="Turno Nocturno (07:00 PM - 07:00 AM)">Turno Nocturno (07:00 PM - 07:00 AM)</option>
                  <option value="Fines de Semana">Fines de Semana</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Comuna de Residencia</label>
                <input
                  type="text"
                  value={comuna}
                  onChange={e => setComuna(e.target.value)}
                  placeholder="Ej. Comuna 19 o Barrio San Fernando"
                  className="w-full p-2.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVehicle}
                    onChange={e => setHasVehicle(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <span>🚙 Tengo vehículo disponible (Camioneta 4x4 o Moto)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              <span>REGISTRARME COMO VOLUNTARIO</span>
            </button>
          </form>
        </div>

        {/* Volunteers Summary Board */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-base mb-1">Brigadas en Acción en Cali</h3>
            <p className="text-xs text-slate-500 mb-4">
              Puntos de concentración de voluntarios autorizados:
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                <strong className="block text-purple-950 font-bold mb-0.5">
                  1. Brigada Médica HUV y Siloé
                </strong>
                <p className="text-purple-900 text-[11px]">
                  Punto de encuentro: Cruz Roja Valle (Cra 38 Bis # 5-91). Requiere carné profesional de salud.
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <strong className="block text-blue-950 font-bold mb-0.5">
                  2. Brigada de Acopio y Clasificación
                </strong>
                <p className="text-blue-900 text-[11px]">
                  Punto de encuentro: Coliseo del Pueblo (Comuna 19). Organización de kits alimentarios y pañales.
                </p>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <strong className="block text-emerald-950 font-bold mb-0.5">
                  3. Brigada Psicosocial en Albergues
                </strong>
                <p className="text-emerald-900 text-[11px]">
                  Punto de encuentro: Albergue El Guabal y Mariano Ramos. Contención emocional y ludotecas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
