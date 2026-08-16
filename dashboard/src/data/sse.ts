import { API_BASE } from './api';

const EVENT_NAME = 'nuevo-afectado';

export function subscribeToAfectadosUpdates(onUpdate: () => void): () => void {
  const sse = new EventSource(`${API_BASE}/afectados/sse`);

  sse.addEventListener(EVENT_NAME, () => {
    onUpdate();
  });

  sse.onerror = () => {
    sse.close();
  };

  return () => {
    sse.close();
  };
}
