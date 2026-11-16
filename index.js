const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Sigmally / Agario Ozel Sunucusu Aktif!\n');
});

const wss = new WebSocket.Server({ server });

let Clients = [];

wss.on('connection', (ws) => {
  console.log('Yeni bir oyuncu bağlandı!');
  Clients.push(ws);

  ws.on('message', (message) => {
    Clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Bir oyuncu ayrıldı.');
    Clients = Clients.filter(client => client !== ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Oyun sunucusu ${PORT} portunda calisiyor.`);
});
