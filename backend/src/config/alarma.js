const { WebSocketServer } = require('ws');

const WS_PATH = '/alarma';
const HEARTBEAT_INTERVAL_MS = 30000;

const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on('connection', (ws) => {
  ws.isAlive = true;
  clients.add(ws);
  console.log(`🔔 Dispositivo conectado al canal de alarma (${clients.size} total)`);

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`🔕 Dispositivo desconectado del canal de alarma (${clients.size} restantes)`);
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
});

// Los proxies (Railway) cierran conexiones idle; el ping mantiene el canal
// vivo y permite purgar sockets que ya no responden.
const heartbeat = setInterval(() => {
  clients.forEach((ws) => {
    if (!ws.isAlive) {
      clients.delete(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (_) {
      clients.delete(ws);
    }
  });
}, HEARTBEAT_INTERVAL_MS);

/**
 * Adjunta el canal de alarma a un servidor HTTP existente.
 * Solo se aceptan upgrades cuyo path sea exactamente WS_PATH; el resto
 * se rechaza destruyendo el socket (Express no maneja upgrades).
 */
function attachAlarmChannel(server) {
  server.on('upgrade', (req, socket, head) => {
    let pathname;
    try {
      pathname = new URL(req.url, 'http://localhost').pathname;
    } catch (_) {
      socket.destroy();
      return;
    }
    if (pathname !== WS_PATH) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });
}

/** Difunde la señal de alarma a todos los dispositivos conectados. */
function broadcastAlarma(activadoPor) {
  const payload = JSON.stringify({
    alarma: true,
    timestamp: new Date().toISOString(),
    activadoPor: activadoPor || undefined,
  });
  let alcanzados = 0;
  clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(payload);
        alcanzados += 1;
      } catch (_) {
        clients.delete(ws);
      }
    }
  });
  return alcanzados;
}

function clientCount() {
  return clients.size;
}

/** Cierra el canal y todos sus sockets (graceful shutdown). */
function closeAlarmChannel() {
  clearInterval(heartbeat);
  clients.forEach((ws) => {
    try {
      ws.close(1001, 'server shutdown');
    } catch (_) {}
  });
  clients.clear();
  wss.close();
}

module.exports = {
  attachAlarmChannel,
  broadcastAlarma,
  clientCount,
  closeAlarmChannel,
  WS_PATH,
};
