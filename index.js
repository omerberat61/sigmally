const WebSocket = require('ws');
const http = require('http');

// Render'ın verdiği portu kullanan basit bir HTTP ve WebSocket sunucusu
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Sigmally / Agario Ozel Sunucusu Aktif!\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Yeni bir oyuncu bağlandı!');
  
  ws.on('message', (message) => {
    console.log('Gelen mesaj: ' + message);
    ws.send('Sunucu yanıtı: ' + message);
  });

  ws.send(JSON.stringify({ type: 'welcome', message: 'Sunucuya hos geldin kanka!' }));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda calisiyor.`);
});
