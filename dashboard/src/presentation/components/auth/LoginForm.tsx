import { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { login } from '@/data/auth';

interface Props {
  onSuccess: () => void;
  onBack?: () => void;
}

export default function LoginForm({ onSuccess, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Portal de Ayuda Cali</span>
          </button>
        )}

        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">EmerRed PMU Operadores</h1>
            <p className="text-xs text-slate-500">Acceso exclusivo a la consola de mando</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
            Correo Institucional / Operador
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
              placeholder="admin@emerred.co"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
            Contraseña de Seguridad
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
              placeholder="••••••••"
            />
          </label>
          {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm shadow-md"
          >
            {loading ? 'Verificando credenciales...' : 'Ingresar al Panel de Mando'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Acceso de prueba: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">admin@emerred.co</code> / <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
