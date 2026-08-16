const http = require('http');
  const { WebSocketServer } = require('ws');
  const alarmClients = new Set();
  const afectados = new Map(); // numero_celular -> registro
  // --- HTTP: API mínima de afectados ---
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      if (req.method === 'POST' && req.url === '/afectados') {
        const data = JSON.parse(body);
        if (afectados.has(data.numero_celular)) {
          res.writeHead(409);
          return res.end(JSON.stringify({ success: false, message: 'duplicado' }));
        }
        const id = Math.random().toString(16).slice(2).padEnd(24, '0');
        afectados.set(data.numero_celular, { _id: id, ...data });
        console.log('POST /afectados →', data);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: { _id: id, ...data } }));
      }
      if (req.method === 'PUT' && req.url.startsWith('/afectados/')) {
        const data = JSON.parse(body);
        console.log('PUT', req.url, '→', data);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data }));
      }
      if (req.method === 'GET' && req.url.startsWith('/afectadoPorCelular/')) {
        const num = Number(req.url.split('/').pop());
        const rec = afectados.get(num);
        res.writeHead(rec ? 200 : 404);
        return res.end(JSON.stringify({ success: !!rec, data: rec }));
      }
      // Disparador de la alarma: curl -X POST http://IP:3000/activar-alarma
      if (req.method === 'POST' && req.url === '/activar-alarma') {
        const msg = JSON.stringify({ alarma: true });
        alarmClients.forEach((ws) => { try { ws.send(msg); } catch (_) {} });
        console.log(`¡ALARMA! enviada a ${alarmClients.size} dispositivo(s)`);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, dispositivos: alarmClients.size
  }));
      }
      res.writeHead(404);
      res.end(JSON.stringify({ success: false }));
    });
  });
  // --- WebSocket: canal de alarma ---
  const wss = new WebSocketServer({ server, path: '/alarma' });
  wss.on('connection', (ws) => {
    alarmClients.add(ws);
    console.log(`Dispositivo conectado al canal de alarma (${alarmClients.size}
  total)`);
    ws.on('close', () => alarmClients.delete(ws));
  });
