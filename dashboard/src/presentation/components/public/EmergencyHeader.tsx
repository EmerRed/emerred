import { useState } from 'react';
import {
  AlertTriangle,
  HeartHandshake,
  Search,
  Home,
  Activity,
  Droplets,
  BookOpen,
  Users,
  Map as MapIcon,
  Lock,
  Menu,
  X,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';

export type PublicTabId =
  | 'donations'
  | 'missing'
  | 'shelters'
  | 'health'
  | 'sos'
  | 'map'
  | 'utilities'
  | 'guide'
  | 'volunteers';

interface Props {
  activeTab: PublicTabId;
  onSelectTab: (tab: PublicTabId) => void;
  onOpenSosModal: () => void;
  onOpenReportMissingModal: () => void;
  onOpenAdminLogin: () => void;
  onOpenMobileBulletinModal: () => void;
}

export default function EmergencyHeader({
  activeTab,
  onSelectTab,
  onOpenSosModal,
  onOpenReportMissingModal,
  onOpenAdminLogin,
  onOpenMobileBulletinModal,
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS: { id: PublicTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'donations', label: 'Centros de Donación', icon: HeartHandshake },
    { id: 'missing', label: 'Personas Desaparecidas', icon: Search },
    { id: 'shelters', label: 'Albergues y Refugios', icon: Home },
    { id: 'health', label: 'Salud y Hospitales', icon: Activity },
    { id: 'map', label: 'Mapa Interactivo', icon: MapIcon },
    { id: 'sos', label: 'Solicitar Auxilio (SOS)', icon: ShieldAlert },
    { id: 'utilities', label: 'Agua y Servicios', icon: Droplets },
    { id: 'guide', label: 'Guía de Supervivencia', icon: BookOpen },
    { id: 'volunteers', label: 'Voluntariado', icon: Users },
  ];

  function handleTabClick(tab: PublicTabId) {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Emer<span className="text-rose-600">Red</span>
                </span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Cali SOS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Portal Humanitario y Asistencia Post-Sismo — Valle del Cauca
              </p>
            </div>
          </div>

          {/* Action CTAs on Desktop */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={onOpenMobileBulletinModal}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition active:scale-95 border border-slate-700"
              title="Ver y copiar boletín optimizado para la app EmerChat o SMS"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Boletín para App / SMS</span>
            </button>

            <button
              onClick={onOpenSosModal}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md shadow-red-600/20 transition active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Reportar SOS</span>
            </button>

            <button
              onClick={onOpenReportMissingModal}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-sm shadow-sm transition active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Reportar Desaparecido</span>
            </button>

            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-xs font-semibold transition border border-slate-200"
              title="Acceso exclusivo para coordinadores del PMU y operadores EmerRed"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Operadores PMU</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenSosModal}
              className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex gap-1 overflow-x-auto border-t border-slate-100 py-2 scrollbar-none">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="grid grid-cols-3 gap-1.5 pb-3 border-b border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMobileBulletinModal();
              }}
              className="flex flex-col items-center justify-center gap-1 bg-slate-900 text-white font-bold p-2 rounded-lg text-xs shadow"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Boletín App</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSosModal();
              }}
              className="flex flex-col items-center justify-center gap-1 bg-red-600 text-white font-bold p-2 rounded-lg text-xs shadow"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Auxilio SOS</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReportMissingModal();
              }}
              className="flex flex-col items-center justify-center gap-1 bg-amber-500 text-slate-950 font-bold p-2 rounded-lg text-xs shadow"
            >
              <Search className="w-4 h-4" />
              <span>Desaparecido</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                    isActive
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 w-full px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Acceso para Operadores PMU / Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
