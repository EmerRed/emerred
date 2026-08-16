import { useState } from 'react';
import { Volume2, X, PhoneCall, ShieldAlert } from 'lucide-react';
import { CALI_EMERGENCY_CONTACTS } from '@/data/caliEmergencyData';

interface Props {
  onOpenSos: () => void;
  onOpenMissing: () => void;
}

export default function EmergencyBanner({ onOpenSos }: Props) {
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);

  function playAlertBeep() {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
      setSoundPlaying(true);
      setTimeout(() => setSoundPlaying(false), 1000);
    } catch {
      // AudioContext not supported
    }
  }

  return (
    <div className="w-full bg-slate-900 text-white border-b border-rose-800 shadow-md">
      {!dismissedAlert && (
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs md:text-sm font-medium">
            <div className="flex items-center gap-2 text-center md:text-left">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
              <span className="font-extrabold uppercase tracking-wider text-amber-200">
                🚨 ALERTA ROJA EN SANTIAGO DE CALI
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="text-white/95">
                Sismo magnitud 6.8 M_w en Valle del Cauca. Puesto de Mando Unificado (PMU) activo en el CAM y Coliseo del Pueblo.
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={playAlertBeep}
                title="Tono de atención"
                className="flex items-center gap-1 bg-black/20 hover:bg-black/40 px-2 py-1 rounded text-white/90 transition text-xs"
              >
                <Volume2 className={`w-3.5 h-3.5 ${soundPlaying ? 'animate-bounce text-amber-300' : ''}`} />
                <span>Alerta</span>
              </button>
              <button
                onClick={() => setDismissedAlert(true)}
                className="text-white/70 hover:text-white transition p-1"
                aria-label="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Hotlines Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase tracking-wide">
          <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Líneas de Auxilio Inmediato (1 Clic para Llamar):</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {CALI_EMERGENCY_CONTACTS.slice(0, 5).map(c => (
            <a
              key={c.name}
              href={`tel:${c.phone}`}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-900 border border-slate-700 hover:border-rose-600 px-2.5 py-1 rounded-md text-slate-200 hover:text-white transition font-medium text-xs shadow-sm"
              title={`${c.name} - ${c.description}`}
            >
              <span className="font-bold text-rose-400">{c.phone}</span>
              <span className="text-slate-300">{c.name.split(' ')[0]}</span>
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onOpenSos}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded text-xs transition flex items-center gap-1 shadow"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS Urgente</span>
          </button>
        </div>
      </div>
    </div>
  );
}
