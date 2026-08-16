import { useState } from 'react';
import { X, HeartHandshake, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationOfferModal({ isOpen, onClose }: Props) {
  const [donorName, setDonorName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [supplyType, setSupplyType] = useState('alimentos');
  const [quantityDetail, setQuantityDetail] = useState('');
  const [requiresLogistics, setRequiresLogistics] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!donorName || !phone || !quantityDetail) {
      alert('Por favor complete los campos requeridos.');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-700 text-white">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-rose-200" />
            <h3 className="text-base font-bold">Ofrecer Donación Masiva o Empresarial</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h4 className="text-lg font-bold text-slate-900">¡Oferta Registrada Exitosamente!</h4>
            <p className="text-xs text-slate-600">
              El equipo de Logística Humanitaria de la Alcaldía de Cali y la Cruz Roja Seccional Valle se comunicará al teléfono suministrado para coordinar la recepción o recogida en bodega.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <p className="text-slate-600">
              Para donaciones a granel (camiones de agua, pallets de alimentos, carpas industriales, maquinaria o medicamentos hospitalarios), el PMU coordina transporte y acopio seguro.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Donante / Contacto *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="Ej. Juan Felipe Morales"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Empresa u Organización</label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="Ej. Distribuidora del Valle S.A.S"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej. 318 765 4321"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Insumos *</label>
              <select
                value={supplyType}
                onChange={e => setSupplyType(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-rose-500"
              >
                <option value="alimentos">Alimentos no perecederos a granel</option>
                <option value="agua">Agua potable en pimpinas / botellones</option>
                <option value="medicamentos">Insumos médicos y hospitalarios</option>
                <option value="colchonetas">Colchonetas, frazadas o carpas</option>
                <option value="herramientas">Herramientas pesadas / Maquinaria / Generadores</option>
                <option value="transporte">Vehículos / Camiones de carga</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detalle y Cantidad Estimada *</label>
              <textarea
                required
                rows={3}
                value={quantityDetail}
                onChange={e => setQuantityDetail(e.target.value)}
                placeholder="Ej. 200 cajas de atún (4.800 latas), 500 botellones de agua de 5L y 100 cobijas térmicas..."
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresLogistics}
                  onChange={e => setRequiresLogistics(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span>Requiere que un camión oficial del PMU recoja la donación en bodega</span>
              </label>
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
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Registro de Donación</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
