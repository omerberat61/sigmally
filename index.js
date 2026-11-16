const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', function(ws) {
  console.log('Oyuncu bağlandı!');
  ws.send('Sunucu aktif!');
});

console.log('Sunucu çalışıyor!');
