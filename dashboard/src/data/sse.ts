import { API_BASE } from './api';

const EVENT_NAME = 'nuevo-afectado';

export function subscribeToAfectadosUpdates(onUpdate: () => void): () => void {
  const sse = new EventSource(`${API_BASE}/afectados/sse`);

  sse.addEventListener(EVENT_NAME, () => {
    onUpdate();
  });

  // EventSource se reconecta solo por defecto; no cerramos manualmente en error.
  // Se retorna una funcion de limpieza para cerrar cuando el componente se desmonta.
  return () => {
    sse.close();
  };
}
