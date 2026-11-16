const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Omerixxs Agario</title>
  <style>
    body { background: #111; color: #fff; text-align: center; font-family: Arial; margin-top: 150px; }
    input, button { padding: 12px; font-size: 16px; border-radius: 6px; border: none; margin: 5px; }
    button { background: #00e676; color: #000; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <h1>OMERIXXS ÖZEL SUNUCU AKTİF!</h1>
  <p>Sunucu ve WebSocket altyapısı başarıyla çalışıyor.</p>
  <input type="text" id="name" placeholder="Oyuncu Adı..." value="Omer">
  <br>
  <button onclick="alert('Sunucuya bağlantı kuruldu! İyi oyunlar.')">BAĞLAN</button>
</body>
</html>`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Yeni bir oyuncu bağlandı!');
  ws.on('message', (message) => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Sunucu calisiyor: ' + PORT);
});
