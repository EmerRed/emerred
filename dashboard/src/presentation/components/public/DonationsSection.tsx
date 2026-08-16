import { useState } from 'react';
import {
  HeartHandshake,
  MapPin,
  Clock,
  Phone,
  Share2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Building,
  AlertCircle,
  Package,
  PlusCircle,
} from 'lucide-react';
import type { DonationCenter, DonationCategory } from '@/domain/types';
import { OFFICIAL_DONATION_ACCOUNTS, DONATION_GUIDE } from '@/data/caliEmergencyData';

interface Props {
  donationCenters: DonationCenter[];
  onOpenDonationOffer: () => void;
  onNavigateToMap: (centerId: string) => void;
}

const CATEGORY_LABELS: Record<DonationCategory, { label: string; icon: string }> = {
  alimentos: { label: 'Alimentos', icon: '🥫' },
  agua: { label: 'Agua Potable', icon: '💧' },
  higiene: { label: 'Kits Higiene', icon: '🧼' },
  ropa_cobijas: { label: 'Cobijas & Ropa', icon: '🧥' },
  medicamentos: { label: 'Medicamentos', icon: '💊' },
  mascotas: { label: 'Mascotas', icon: '🐾' },
  herramientas: { label: 'Herramientas', icon: '🛠️' },
};

export default function DonationsSection({
  donationCenters,
  onOpenDonationOffer,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2500);
  }

  function shareCenter(center: DonationCenter) {
    const text = `🚨 *Punto de Donación en Cali:* ${center.name}\n📍 *Dirección:* ${center.address} (${center.comuna})\n⏰ *Horario:* ${center.schedule}\n📞 *Teléfono:* ${center.phone}\n📦 *Necesidades Urgentes:* ${center.urgentNeeds.join(', ')}\n\n_Información verificada por EmerRed Cali_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  const filteredCenters = donationCenters.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.comuna.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.urgentNeeds.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      selectedCategory === 'all' ||
      c.acceptedCategories.includes(selectedCategory as DonationCategory);

    const matchUrgent = !filterUrgentOnly || c.status === 'urgent';

    return matchSearch && matchCategory && matchUrgent;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Section */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Package className="w-3.5 h-3.5" />
            <span>Red Solidaria Cali — Acopio Oficial</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Centros de Acopio y Donaciones en Cali
          </h2>
          <p className="text-white/90 text-sm sm:text-base mt-2 leading-relaxed">
            Consulte los puntos oficiales autorizados por la Alcaldía de Cali, Cruz Roja Seccional Valle y Defensa Civil para entregar víveres, agua, colchonetas y medicamentos para los damnificados.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenDonationOffer}
              className="flex items-center gap-2 bg-white text-rose-700 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <span>Registrar Oferta de Donación Masiva</span>
            </button>

            <a
              href="#cuentas-bancarias"
              className="flex items-center gap-2 bg-rose-900/60 hover:bg-rose-900/80 border border-white/30 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition"
            >
              <span>Ver Cuentas Bancarias Verificadas</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por centro, barrio, comuna o insumo..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterUrgentOnly}
                onChange={e => setFilterUrgentOnly(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span>Solo Centros con Urgencia Alta</span>
            </label>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {filteredCenters.length} Puntos encontrados
            </span>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos los insumos
          </button>
          {(Object.keys(CATEGORY_LABELS) as DonationCategory[]).map(cat => {
            const { label, icon } = CATEGORY_LABELS[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Donation Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map(center => {
          const isUrgent = center.status === 'urgent';
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.long}`;

          return (
            <div
              key={center.id}
              className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                isUrgent ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
              }`}
            >
              <div className="p-5">
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {center.comuna}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {center.name}
                    </h3>
                  </div>
                  {isUrgent ? (
                    <span className="bg-red-100 text-red-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      Recepción Urgente
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0">
                      Activo
                    </span>
                  )}
                </div>

                {/* Location and Info */}
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{center.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{center.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Responsable: <strong className="text-slate-700">{center.responsibleOrg}</strong></span>
                  </div>
                </div>

                {/* Urgent Needs Box */}
                <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Insumos de Mayor Prioridad Aquí:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {center.urgentNeeds.map((need, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                        <span>{need}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Accepted Category Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {center.acceptedCategories.map(cat => (
                    <span
                      key={cat}
                      className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    >
                      {CATEGORY_LABELS[cat]?.label ?? cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
                <a
                  href={`tel:${center.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-rose-600 transition"
                  title="Llamar al centro"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  <span>{center.phone}</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => shareCenter(center)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Compartir por WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Cómo Llegar</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide: What to donate and what NOT to donate */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-rose-600" />
          <span>Guía para una Donación Humanitaria Responsable</span>
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Para garantizar una logística eficiente y proteger la dignidad y salud de los damnificados en Cali, siga las directrices del Puesto de Mando Unificado (PMU):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SI LLEVAR */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>LO QUE SÍ SE NECESITA URGENTEMENTE</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {DONATION_GUIDE.siLlevar.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NO LLEVAR */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-4">
              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>LO QUE NO SE DEBE LLEVAR (Evita entorpecer la labor)</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {DONATION_GUIDE.noLlevar.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Official Bank Accounts Section */}
      <div id="cuentas-bancarias" className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="max-w-3xl mb-6">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            Aportes Económicos Oficiales
          </span>
          <h3 className="text-2xl font-black tracking-tight text-white mt-1">
            Cuentas Bancarias Verificadas para Ayuda Humanitaria
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm mt-2">
            No realice transferencias a cuentas de personas naturales desconocidas. Estas son las únicas cuentas institucionales autorizadas por los organismos de socorro para atender la emergencia en Cali:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFICIAL_DONATION_ACCOUNTS.map((acc, idx) => (
            <div
              key={idx}
              className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-rose-900/60 text-rose-300 border border-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    OFICIAL VERIFICADO
                  </span>
                  <span className="text-xs text-slate-400 font-mono">NIT: {acc.nit}</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{acc.entity}</h4>
                <p className="text-xs text-slate-400 mb-4">{acc.purpose}</p>

                <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Banco:</span>
                    <span className="text-slate-200 font-bold">{acc.bank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tipo:</span>
                    <span className="text-slate-200">{acc.accountType}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Número:</span>
                    <span className="text-amber-300 font-bold text-sm tracking-wider">
                      {acc.accountNumber}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-emerald-400 font-medium">
                  {acc.nequiDaviplata}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <button
                  onClick={() => copyToClipboard(acc.accountNumber, `acc-${idx}`)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition w-full justify-center"
                >
                  {copiedAccount === `acc-${idx}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>¡Número de cuenta copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Número de Cuenta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
