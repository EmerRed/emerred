import { useState } from 'react';
import { Megaphone } from 'lucide-react';

interface Props {
  onSubmit: (tipo: string, mensaje: string) => Promise<void>;
}

export default function BroadcastForm({ onSubmit }: Props) {
  const [tipo, setTipo] = useState('inundacion');
  const [mensaje, setMensaje] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(tipo, mensaje);
    setMensaje('');
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Megaphone className="w-5 h-5" /> Emitir alerta CBS
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Tipo
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            required
            className="p-2 border rounded-lg text-sm"
          >
            <option value="inundacion">Inundación</option>
            <option value="derrumbe">Derrumbe</option>
            <option value="incendio">Incendio</option>
            <option value="seguridad">Seguridad</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Mensaje
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribí el mensaje de la alerta..."
            required
            className="p-2 border rounded-lg text-sm min-h-[80px] resize-y"
          />
        </label>
        <button
          type="submit"
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Enviar alerta
        </button>
      </form>
    </div>
  );
}
