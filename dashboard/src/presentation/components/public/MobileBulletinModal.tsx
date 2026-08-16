import { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  Download,
  Share2,
  Radio,
  FileText,
  FileCode,
} from 'lucide-react';
import {
  INITIAL_DONATION_CENTERS,
  INITIAL_SHELTERS,
  INITIAL_HEALTH_CENTERS,
  INITIAL_WATER_POINTS,
} from '@/data/caliEmergencyData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileBulletinModal({ isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const nowStr = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Build clean plain-text bulletin optimized for mobile/SMS/EmerChat mesh
  const lines: string[] = [
    '╔══════════════════════════════════════════════╗',
    '   🚨 BOLETÍN OFICIAL DE EMERGENCIA — CALI',
    `   📅 ${nowStr} | Red Solidaria EmerRed`,
    '╚══════════════════════════════════════════════╝',
    '',
    '⚠️ ESTADO: ALERTA ROJA POR SISMO EN VALLE DEL CAUCA',
    '🏛️ Puesto de Mando Unificado (PMU): Activo en el CAM y Coliseo del Pueblo.',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📞 LÍNEAS DE AUXILIO INMEDIATO 24/7 (1 Clic)',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '• 🚒 Bomberos Cali (Rescate/Fugas): 119 o (602) 884 1000',
    '• 🚑 Cruz Roja Valle (Ambulancias): 132 o (602) 518 4200',
    '• ⛑️ Defensa Civil (Albergues/Socorro): 144 o (602) 660 3000',
    '• 🚨 Policía Metropolitana Cali: 123',
    '• 🏥 CRUE Valle (Urgencias Médicas): 125',
    '• 🧠 Salud Mental y Apoyo Psicológico: 106',
    '• 💧 Emcali (Acueducto y Daños de Luz): 177',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📦 CENTROS DE ACOPIO Y DONACIONES EN CALI',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  INITIAL_DONATION_CENTERS.slice(0, 5).forEach((c, idx) => {
    const icon = c.status === 'urgent' ? '🔴' : '🟢';
    lines.push(`${idx + 1}. ${icon} ${c.name}`);
    lines.push(`   📍 ${c.address} (${c.comuna})`);
    lines.push(`   ⏰ Horario: ${c.schedule} | 📞 Tel: ${c.phone}`);
    lines.push(`   📦 Urgente: ${c.urgentNeeds.slice(0, 3).join(', ')}`);
    lines.push('');
  });

  lines.push('🥫 QUÉ SÍ LLEVAR: Agua embotellada, arroz, atún, leche en polvo, pañales, colchonetas y medicamentos básicos.');
  lines.push('❌ QUÉ NO LLEVAR: Ropa sucia/rota, comida perecedera sin refrigerar, medicamentos vencidos.');
  lines.push('');

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('⛺ ALBERGUES TEMPORALES CON CUPOS ACTIVOS');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  INITIAL_SHELTERS.slice(0, 4).forEach((sh, idx) => {
    const free = Math.max(0, sh.capacity - sh.occupied);
    const pct = Math.round((sh.occupied / sh.capacity) * 100);
    lines.push(`${idx + 1}. 🏠 ${sh.name}`);
    lines.push(`   📍 ${sh.address} (${sh.comuna})`);
    lines.push(`   👥 Cupos Libres: ${free} de ${sh.capacity} plazas (${pct}% ocupado)`);
    lines.push(`   📞 Tel: ${sh.phone}`);
    lines.push('');
  });

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('🩺 HOSPITALES EN ALERTA Y DONACIÓN DE SANGRE');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('🩸 URGENTE: Se requieren donantes de sangre O-, O+ y A+.');
  INITIAL_HEALTH_CENTERS.slice(0, 4).forEach(h => {
    lines.push(`• ${h.name}: ${h.address} | 📞 ${h.phone}`);
  });
  lines.push('');

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('💧 DISTRIBUCIÓN DE AGUA POTABLE (CARROTANQUES)');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  INITIAL_WATER_POINTS.slice(0, 4).forEach(w => {
    const stText = w.status === 'arrived' ? 'En el sitio' : w.status === 'en_route' ? 'En ruta' : 'Programado';
    lines.push(`• 🚛 ${w.location} (${w.comuna})`);
    lines.push(`  ⏰ ${w.schedule} | Estado: ${stText}`);
  });
  lines.push('');

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📖 GUÍA RÁPIDA: QUÉ HACER ANTE RÉPLICAS');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('1. Agáchese, cúbrase bajo un mueble resistente y agárrese.');
  lines.push('2. Aléjese de postes, cables caídos y ventanas de vidrio.');
  lines.push('3. Cierre la llave de paso de gas y desconecte interruptores.');
  lines.push("4. Si su casa tiene grietas en forma de 'X' en columnas, EVACÚE.");
  lines.push('5. Tenga lista su mochila con agua, linterna, silbato y documentos.');
  lines.push('');
  lines.push('📡 Difundido a través de la Red EmerRed Cali. Comparte este mensaje con tu comunidad.');

  const bulletinText = lines.join('\n');

  function handleCopy() {
    navigator.clipboard.writeText(bulletinText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleDownloadTxt() {
    const blob = new Blob([bulletinText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boletin_emergencia_cali_app.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    const data = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      evento: 'SISMO_VALLE_DEL_CAUCA_6.8',
      centros_acopio: INITIAL_DONATION_CENTERS,
      albergues: INITIAL_SHELTERS,
      hospitales: INITIAL_HEALTH_CENTERS,
      distribucion_agua: INITIAL_WATER_POINTS,
      texto_boletin: bulletinText,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boletin_emergencia_cali_app.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleShareWhatsapp() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(bulletinText)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col my-auto border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <span>Boletín Formateado para App Móvil / EmerChat</span>
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
                  Bajo Ancho de Banda
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Información consolidada de la página en formato legible para pantallas de celular, SMS y redes mesh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Listo para transmitir o copiar a canales móviles:</span>
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleShareWhatsapp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition"
              title="Descargar archivo de texto plano para SMS o EmerChat"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>.TXT</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition"
              title="Descargar paquete JSON estructurado para la aplicación Android"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-600" />
              <span>.JSON</span>
            </button>
          </div>
        </div>

        {/* Text Preview Box */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed selection:bg-rose-600 selection:text-white">
          <pre className="whitespace-pre-wrap font-mono">{bulletinText}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 rounded-b-2xl">
          <span className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Optimizado para el agente CLI (<code className="bg-slate-200 px-1 rounded text-slate-800 font-bold">python -m synth collect-portal</code>) y EmerChat Android.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
