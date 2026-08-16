const { WebSocket, WebSocketServer } = require('ws');

const WS_PATH = '/alarma';
const HEARTBEAT_INTERVAL_MS = 30000;

const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

function isOpen(ws) {
  return ws.readyState === WebSocket.OPEN;
}

function pruneDeadClients() {
  clients.forEach((ws) => {
    if (!isOpen(ws)) {
      clients.delete(ws);
    }
  });
}

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

  // Confirma al cliente que el canal quedó activo (útil para diagnóstico).
  if (isOpen(ws)) {
    try {
      ws.send(JSON.stringify({ tipo: 'conectado', canal: WS_PATH, timestamp: new Date().toISOString() }));
    } catch (_) {
      clients.delete(ws);
    }
  }
});

const heartbeat = setInterval(() => {
  clients.forEach((ws) => {
    if (!ws.isAlive) {
      clients.delete(ws);
      try {
        ws.terminate();
      } catch (_) {}
      return;
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (_) {
      clients.delete(ws);
    }
  });
}, HEARTBEAT_INTERVAL_MS);

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

function broadcastAlarma(activadoPor, metadata = {}) {
  pruneDeadClients();

  const payload = JSON.stringify({
    alarma: true,
    timestamp: new Date().toISOString(),
    activadoPor: activadoPor || undefined,
    tipo: metadata.tipo || undefined,
    mensaje: metadata.mensaje || undefined,
  });

  let alcanzados = 0;
  clients.forEach((ws) => {
    if (!isOpen(ws)) {
      clients.delete(ws);
      return;
    }
    try {
      ws.send(payload);
      alcanzados += 1;
    } catch (_) {
      clients.delete(ws);
    }
  });

  return alcanzados;
}

function clientCount() {
  pruneDeadClients();
  return clients.size;
}

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
