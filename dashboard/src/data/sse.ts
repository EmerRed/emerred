import { API_BASE } from './api';
import type { Afectado } from '@/domain/types';

const EVENT_NAME = 'nuevo-afectado';

export function subscribeToAfectadosUpdates(onUpdate: (afectado: Afectado) => void): () => void {
  const sse = new EventSource(`${API_BASE}/afectados/sse`);

  sse.addEventListener(EVENT_NAME, (event) => {
    try {
      const afectado = JSON.parse((event as MessageEvent).data) as Afectado;
      onUpdate(afectado);
    } catch {
      // Ignorar mensajes mal formados
    }
  });

  return () => {
    sse.close();
  };
}
