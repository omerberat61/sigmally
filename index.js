const http = require('http');
const WebSocket = require('ws');

// Orijinal Sigmally index.html iskeleti ve game.js bağlantısı
const htmlPage = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Sigmally - Orijinal Sunucu</title>
<style>
  body { margin: 0; overflow: hidden; background: #0b0b14; font-family: 'Segoe UI', sans-serif; color: #fff; }
  canvas { display: block; }
  #sigmod-bar {
    position: absolute; top: 0; left: 0; width: 100%; height: 35px;
    background: rgba(0, 0, 0, 0.75); border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: space-between; padding: 0 15px;
    box-sizing: border-box; font-size: 12px; z-index: 20; color: #ccc;
  }
  #sigmod-bar b { color: #c77dff; }
  #menu-container {
    position: absolute; top: 35px; left: 0; width: 100%; height: calc(100vh - 35px);
    display: flex; justify-content: center; align-items: center; z-index: 10;
  }
  .sig-panel {
    background: rgba(18, 18, 30, 0.95); border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px; padding: 25px; width: 340px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    box-sizing: border-box; text-align: center;
  }
  input, select {
    width: 100%; padding: 12px; margin-bottom: 10px; background: #181828; border: 1px solid #443366;
    color: #fff; border-radius: 6px; box-sizing: border-box; text-align: center; font-size: 14px; outline: none;
  }
  .btn-play {
    background: linear-gradient(135deg, #2ec4b6, #25a18e); color: #fff; font-weight: bold; padding: 12px; border: none;
    border-radius: 6px; width: 100%; cursor: pointer; font-size: 16px; box-shadow: 0 4px 15px rgba(46,196,182,0.4);
  }
  #leaderboard {
    position: absolute; top: 50px; right: 20px; background: rgba(18, 18, 30, 0.85);
    padding: 12px; border-radius: 10px; min-width: 180px; border: 1px solid rgba(255,255,255,0.1);
    font-size: 13px; display: none; z-index: 10;
  }
  #leaderboard b { color: #c77dff; display: block; margin-bottom: 6px; text-align: center; }
  #hud {
    position: absolute; bottom: 20px; left: 20px; background: rgba(18, 18, 30, 0.85);
    padding: 10px 18px; border-radius: 8px; font-size: 16px; font-weight: bold; 
    border: 1px solid rgba(255,255,255,0.1); display: none; z-index: 10;
  }
</style>
</head>
<body>

<div id="sigmod-bar">
  <div><b>SigMod v11.0.1</b> by Cursed | Orijinal Sistem</div>
  <div>Omerixxs Özel Sunucu</div>
</div>

<div id="menu-container">
  <div class="sig-panel">
    <h2 style="color: #b19cd9; margin-top:0;">Sigmally</h2>
    <input type="text" id="nick" placeholder="Oyuncu Adı..." maxlength="15" value="Omerixxs">
    <button class="btn-play" id="play-btn" onclick="startGame()">Oynamak</button>
  </div>
</div>

<div id="hud">Skor: <span id="score">20</span></div>
<div id="leaderboard"><b>Liderlik Tablosu</b><div id="lb-list"></div></div>
<canvas id="canvas"></canvas>

<!-- Orijinal game.js entegrasyonu -->
<script src="/game.js"></script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/game.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    // Az önce çektiğin orijinal game.js içeriği
    res.end(`[cite: 4]`);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlPage);
  }
});

const wss = new WebSocket.Server({ server });

const MAP_SIZE = 3000;
let players = {};
let foods = [];
let viruses = [];
const colors = ['#7b2cbf', '#4cc9f0', '#f72585', '#4895ef', '#560bad', '#4361ee', '#ff0054', '#06d6a0'];

for (let i = 0; i < 200; i++) {
  foods.push({
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
}

for (let i = 0; i < 10; i++) {
  viruses.push({
    x: Math.random() * (MAP_SIZE - 400) + 200,
    y: Math.random() * (MAP_SIZE - 400) + 200,
    r: 35
  });
}

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substr(2, 9);
  ws.send(JSON.stringify({ type: 'init', id: id, mapSize: MAP_SIZE }));

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'join') {
        players[id] = {
          id: id,
          name: data.name.substring(0, 15),
          x: Math.random() * (MAP_SIZE - 400) + 200,
          y: Math.random() * (MAP_SIZE - 400) + 200,
          r: 25,
          dx: 0,
          dy: 0,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    delete players[id];
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Orijinal game.js ve sunucu aktif: ' + PORT);
});
