import type { Report, ActiveAlert, Stats } from '@/domain/types';

const CATEGORIAS = ['inundacion', 'derrumbe', 'incendio', 'seguridad', 'heridos', 'atrapado'];
const MENSAJES: Record<string, string> = {
  inundacion: 'Inundación en la zona, necesitamos ayuda.',
  derrumbe: 'Derrumbe reportado, posibles personas atrapadas.',
  incendio: 'Incendio visible, humo denso.',
  seguridad: 'Situación de seguridad en el sector.',
  heridos: 'Hay heridos, requerimos atención médica.',
  atrapado: 'Persona atrapada, necesitamos rescate.',
};

function randomPriority(): Report['prioridad'] {
  const r = Math.random();
  if (r < 0.2) return 'critica';
  if (r < 0.45) return 'alta';
  if (r < 0.75) return 'media';
  return 'baja';
}

function generateReports(count: number): Report[] {
  const reports: Report[] = [];
  const baseLat = 4.61;
  const baseLon = -74.08;

  for (let i = 0; i < count; i++) {
    const lat = baseLat + (Math.random() - 0.5) * 0.18;
    const lon = baseLon + (Math.random() - 0.5) * 0.18;
    const categoria = CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)];
    const prioridad = randomPriority();
    const asignado = Math.random() < 0.3 ? 'Voluntario asignado' : null;

    reports.push({
      id: `rpt-${i + 1}`,
      lat,
      lon,
      accuracy: Math.round((5 + Math.random() * 25) * 10) / 10,
      prioridad,
      categoria,
      mensaje: MENSAJES[categoria],
      asignado,
      direccion: `Calle ${Math.floor(Math.random() * 150)} #${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 50)}, Bogotá`,
      ciudad: 'Bogotá',
      creado: new Date(Date.now() - Math.random() * 1_000_000_000).toISOString(),
    });
  }

  return reports;
}

const MOCK_REPORTS: Report[] = generateReports(80);

let MOCK_ALERTS: ActiveAlert[] = [
  {
    id: 'alert-1',
    active: true,
    tipo: 'inundacion',
    mensaje: 'Riesgo de inundación en el centro. Evacuar a zonas altas.',
    ciudad: 'Bogotá',
    radio: 5000,
  },
];

function computeStats(): Stats {
  const total = MOCK_REPORTS.length;
  const criticas = MOCK_REPORTS.filter(r => r.prioridad === 'critica').length;
  const altas = MOCK_REPORTS.filter(r => r.prioridad === 'alta').length;
  const medias = MOCK_REPORTS.filter(r => r.prioridad === 'media').length;
  const bajas = MOCK_REPORTS.filter(r => r.prioridad === 'baja').length;
  const asignados = MOCK_REPORTS.filter(r => r.asignado).length;

  const porCategoria: Record<string, number> = {};
  for (const c of CATEGORIAS) {
    porCategoria[c] = MOCK_REPORTS.filter(r => r.categoria === c).length;
  }

  return { total, criticas, altas, medias, bajas, asignados, porCategoria };
}

export async function getReports(): Promise<Report[]> {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_REPORTS), 500));
}

export async function getActiveAlerts(): Promise<ActiveAlert[]> {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_ALERTS.filter(a => a.active)), 300));
}

export async function getStats(): Promise<Stats> {
  return new Promise(resolve => setTimeout(() => resolve(computeStats()), 400));
}

export async function assignReport(reportId: string, volunteer: string): Promise<void> {
  const report = MOCK_REPORTS.find(r => r.id === reportId);
  if (report) {
    report.asignado = volunteer;
  }
}

export async function broadcastAlert(alert: Omit<ActiveAlert, 'id'>): Promise<void> {
  MOCK_ALERTS.push({
    id: `alert-${Date.now()}`,
    active: true,
    tipo: alert.tipo,
    mensaje: alert.mensaje,
    ciudad: alert.ciudad ?? 'Bogotá',
    radio: alert.radio,
  });
}
