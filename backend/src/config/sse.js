const clients = [];

function addClient(res) {
  clients.push(res);
}

function removeClient(res) {
  const index = clients.indexOf(res);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

function sendEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  clients.forEach(res => {
    try {
      sendEvent(res, event, data);
    } catch (err) {
      // Client disconnected
    }
  });
}

function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(':ok\n\n');

  addClient(res);

  const keepAlive = setInterval(() => {
    res.write(':keep-alive\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
    removeClient(res);
  });

  req.on('error', () => {
    clearInterval(keepAlive);
    removeClient(res);
  });
}

module.exports = {
  handleSSE,
  broadcast,
};
