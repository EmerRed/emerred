import { Construction, Megaphone } from 'lucide-react';

export default function AlertsTab() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] text-center px-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-lg w-full">
        <div className="flex justify-center mb-4">
          <span className="bg-amber-100 text-amber-700 p-4 rounded-full">
            <Construction className="w-10 h-10" />
          </span>
        </div>
        <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-slate-900 mb-2">
          <Megaphone className="w-5 h-5 text-amber-600" />
          Alertas — En construcción
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          La activación de alarmas por WebSocket a dispositivos móviles está temporalmente
          deshabilitada mientras ajustamos la integración con la app.
        </p>
        <p className="text-slate-500 text-xs mt-4">
          Podés seguir usando las pestañas de Resumen, Mapa y Reportes con normalidad.
        </p>
      </div>
    </div>
  );
}
