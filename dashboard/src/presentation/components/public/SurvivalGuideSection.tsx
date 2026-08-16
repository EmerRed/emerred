import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Shield,
  Package,
} from 'lucide-react';
import { SURVIVAL_GUIDE_SECTIONS } from '@/data/caliEmergencyData';

const BACKPACK_CHECKLIST = [
  'Agua embotellada (mínimo 2L por persona/día)',
  'Alimentos no perecederos con abrefácil (atún, barras energéticas, frutos secos)',
  'Linterna LED recargable o con pilas de repuesto',
  'Radio portátil FM/AM a pilas para escuchar boletines oficiales',
  'Botiquín de primeros auxilios y medicamentos de uso continuo',
  'Silbato para señalización acústica de rescate',
  'Copia de documentos de identidad en bolsa plástica hermética',
  'Cobija térmica o manta ligera impermeable',
  'Muda de ropa cómoda y zapatos resistentes',
  'Papel higiénico, toallas húmedas y gel antibacterial',
  'Encendedor o fósforos en bolsa hermética',
  'Batería externa portátil (Power Bank) cargada para celular',
];

export default function SurvivalGuideSection() {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  function toggleCheck(idx: number) {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / BACKPACK_CHECKLIST.length) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manual Ciudadano de Autoprotección — Terremoto Cali</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Guía de Supervivencia y Protocolo Post-Sismo
          </h2>
          <p className="text-amber-100 text-sm sm:text-base mt-2 leading-relaxed">
            Instrucciones verificadas de protección civil ante réplicas, cómo evaluar daños en su vivienda y lista interactiva de la mochila de 72 horas.
          </p>
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SURVIVAL_GUIDE_SECTIONS.map(section => (
          <div
            key={section.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <span>{section.title}</span>
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {section.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Interactive 72h Backpack Checklist */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-rose-600" />
              <span>Checklist Interactivo: Mochila de Emergencia (72 Horas)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Marque los elementos que ya tiene listos cerca a la puerta de salida de su casa.
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold text-rose-800 shrink-0">
            {completedCount} de {BACKPACK_CHECKLIST.length} elementos ({progressPercent}%)
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-rose-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BACKPACK_CHECKLIST.map((item, idx) => {
            const isChecked = !!checkedItems[idx];
            return (
              <button
                type="button"
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-start gap-2.5 ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className={isChecked ? 'line-through text-emerald-900' : ''}>{item}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
