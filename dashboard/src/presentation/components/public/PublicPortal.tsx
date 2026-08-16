import { useState } from 'react';
import {
  ShieldAlert,
  Search,
  HeartHandshake,
  Home,
  Map as MapIcon,
  Lock,
  Radio,
} from 'lucide-react';
import EmergencyBanner from './EmergencyBanner';
import EmergencyHeader, { type PublicTabId } from './EmergencyHeader';
import DonationsSection from './DonationsSection';
import MissingPersonsSection from './MissingPersonsSection';
import SheltersSection from './SheltersSection';
import HealthSection from './HealthSection';
import SosSection from './SosSection';
import InteractiveMapSection from './InteractiveMapSection';
import UtilitiesSection from './UtilitiesSection';
import SurvivalGuideSection from './SurvivalGuideSection';
import VolunteersSection from './VolunteersSection';
import ReportMissingModal from './ReportMissingModal';
import ReportSafeModal from './ReportSafeModal';
import DonationOfferModal from './DonationOfferModal';
import SosModal from './SosModal';
import MobileBulletinModal from './MobileBulletinModal';

import {
  getDonationCenters,
  getMissingPersons,
  addMissingPerson,
  updateMissingPersonStatus,
  getShelters,
  getHealthCenters,
  getWaterPoints,
  getSosReports,
  createSosReport,
  getVolunteers,
  registerVolunteer,
} from '@/data/emergencyStorage';
import type { MissingPerson, MissingPersonStatus, PublicSosReport, VolunteerApplication } from '@/domain/types';

interface Props {
  onOpenAdmin: () => void;
}

export default function PublicPortal({ onOpenAdmin }: Props) {
  const [activeTab, setActiveTab] = useState<PublicTabId>('donations');

  // Data state
  const [donationCenters] = useState(getDonationCenters());
  const [missingPersons, setMissingPersons] = useState(getMissingPersons());
  const [shelters] = useState(getShelters());
  const [healthCenters] = useState(getHealthCenters());
  const [waterPoints] = useState(getWaterPoints());
  const [sosReports, setSosReports] = useState(getSosReports());
  const [volunteers, setVolunteers] = useState(getVolunteers());

  // Modals state
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [reportMissingModalOpen, setReportMissingModalOpen] = useState(false);
  const [reportSafeModalOpen, setReportSafeModalOpen] = useState(false);
  const [donationOfferModalOpen, setDonationOfferModalOpen] = useState(false);
  const [bulletinModalOpen, setBulletinModalOpen] = useState(false);

  function handleAddMissing(person: Omit<MissingPerson, 'id' | 'reportedAt'>) {
    const created = addMissingPerson(person);
    setMissingPersons(prev => [created, ...prev]);
  }

  function handleUpdateStatus(id: string, status: MissingPersonStatus, note?: string) {
    updateMissingPersonStatus(id, status, note);
    setMissingPersons(getMissingPersons());
  }

  async function handleCreateSos(report: Omit<PublicSosReport, 'id' | 'timestamp' | 'status' | 'radicado'>) {
    const created = await createSosReport(report);
    setSosReports(prev => [created, ...prev]);
    return created;
  }

  function handleRegisterVolunteer(vol: Omit<VolunteerApplication, 'id' | 'registeredAt'>) {
    const created = registerVolunteer(vol);
    setVolunteers(prev => [created, ...prev]);
  }

  function handleNavigateToMap() {
    setActiveTab('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Urgent Ticker Banner */}
      <EmergencyBanner
        onOpenSos={() => setSosModalOpen(true)}
        onOpenMissing={() => setReportMissingModalOpen(true)}
      />

      {/* Main Header & Navigation */}
      <EmergencyHeader
        activeTab={activeTab}
        onSelectTab={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSosModal={() => setSosModalOpen(true)}
        onOpenReportMissingModal={() => setReportMissingModalOpen(true)}
        onOpenAdminLogin={onOpenAdmin}
        onOpenMobileBulletinModal={() => setBulletinModalOpen(true)}
      />

      {/* Hero Quick Switcher Cards */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
          <span className="text-slate-500 uppercase tracking-wider hidden md:inline">Accesos Rápidos:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'donations' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Centros de Acopio</span>
            </button>

            <button
              onClick={() => setActiveTab('missing')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'missing' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Personas Desaparecidas</span>
            </button>

            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'shelters' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Albergues</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'map' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Mapa Cali</span>
            </button>

            <button
              onClick={() => setActiveTab('sos')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'sos' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>Auxilio SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'donations' && (
          <DonationsSection
            donationCenters={donationCenters}
            onOpenDonationOffer={() => setDonationOfferModalOpen(true)}
            onNavigateToMap={handleNavigateToMap}
          />
        )}

        {activeTab === 'missing' && (
          <MissingPersonsSection
            missingPersons={missingPersons}
            onOpenReportMissingModal={() => setReportMissingModalOpen(true)}
            onOpenReportSafeModal={() => setReportSafeModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'shelters' && (
          <SheltersSection
            shelters={shelters}
            onNavigateToMap={handleNavigateToMap}
          />
        )}

        {activeTab === 'health' && (
          <HealthSection
            healthCenters={healthCenters}
            onNavigateToMap={handleNavigateToMap}
          />
        )}

        {activeTab === 'sos' && (
          <SosSection
            sosReports={sosReports}
            onCreateSos={handleCreateSos}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMapSection
            donationCenters={donationCenters}
            shelters={shelters}
            healthCenters={healthCenters}
            waterPoints={waterPoints}
            sosReports={sosReports}
          />
        )}

        {activeTab === 'utilities' && (
          <UtilitiesSection waterPoints={waterPoints} />
        )}

        {activeTab === 'guide' && (
          <SurvivalGuideSection />
        )}

        {activeTab === 'volunteers' && (
          <VolunteersSection
            volunteers={volunteers}
            onRegisterVolunteer={handleRegisterVolunteer}
          />
        )}
      </main>

      {/* Floating Emergency SOS Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => setSosModalOpen(true)}
          className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-3.5 rounded-full shadow-2xl shadow-red-600/50 border-2 border-white transition-all transform hover:scale-105 active:scale-95 animate-bounce-slow"
          title="Emitir Solicitud SOS de Auxilio Urgente"
        >
          <ShieldAlert className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-sm tracking-wide uppercase">BOTÓN SOS CALI</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-lg">
              <Radio className="w-5 h-5 text-rose-500" />
              <span>EmerRed Cali</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Plataforma digital para la gestión de damnificados, búsqueda familiar, centros de donación y auxilio de emergencias en la ciudad de Cali y Valle del Cauca.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Panel de Operadores y PMU</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Líneas de Atención 24/7</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>🚒 <strong className="text-slate-300">119</strong> Bomberos Voluntarios Cali</li>
              <li>🚑 <strong className="text-slate-300">132</strong> Cruz Roja Seccional Valle</li>
              <li>⛑️ <strong className="text-slate-300">144</strong> Defensa Civil Cali</li>
              <li>🚨 <strong className="text-slate-300">123</strong> Policía Nacional</li>
              <li>🧠 <strong className="text-slate-300">106</strong> Salud Mental y Contención</li>
              <li>💧 <strong className="text-slate-300">177</strong> Emcali Acueducto / Energía</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Secciones de Ayuda</h4>
            <ul className="space-y-1 text-slate-400">
              <li>
                <button onClick={() => setActiveTab('donations')} className="hover:text-white transition">
                  • Puntos de Acopio y Donaciones
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('missing')} className="hover:text-white transition">
                  • Personas Desaparecidas y Ubicadas
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('shelters')} className="hover:text-white transition">
                  • Albergues y Refugios Temporales
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('health')} className="hover:text-white transition">
                  • Hospitales y Puestos de Triage
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('utilities')} className="hover:text-white transition">
                  • Rutas de Carrotanques Emcali
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('guide')} className="hover:text-white transition">
                  • Guía de Réplicas y Mochila 72h
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Organismos Coordinadores</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Información articulada con la Alcaldía de Santiago de Cali, la Secretaría de Gestión del Riesgo (DAGRD), la Cruz Roja Colombiana Seccional Valle y la Defensa Civil.
            </p>
            <span className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} EmerRed. Desarrollado para salvar vidas y coordinar la solidaridad ciudadana.
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportMissingModal
        isOpen={reportMissingModalOpen}
        onClose={() => setReportMissingModalOpen(false)}
        onSubmit={handleAddMissing}
      />

      <ReportSafeModal
        isOpen={reportSafeModalOpen}
        onClose={() => setReportSafeModalOpen(false)}
        onSubmit={handleAddMissing}
      />

      <DonationOfferModal
        isOpen={donationOfferModalOpen}
        onClose={() => setDonationOfferModalOpen(false)}
      />

      <SosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        onSubmit={handleCreateSos}
      />

      <MobileBulletinModal
        isOpen={bulletinModalOpen}
        onClose={() => setBulletinModalOpen(false)}
      />
    </div>
  );
}
