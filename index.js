const http = require('http');
const WebSocket = require('ws');

const htmlPage = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Omerixxs Agar.io Özel Sunucu</title>
<style>
  body { margin: 0; overflow: hidden; background: #111; font-family: Arial, sans-serif; color: white; }
  canvas { display: block; }
  #menu {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(20, 20, 20, 0.95); padding: 30px; border-radius: 12px;
    text-align: center; box-shadow: 0 0 25px rgba(0,255,150,0.3); border: 1px solid #333;
  }
  input {
    padding: 12px; font-size: 16px; border-radius: 6px; border: none;
    outline: none; width: 220px; text-align: center; margin-bottom: 15px; background: #222; color: #fff;
  }
  button {
    padding: 12px 25px; font-size: 16px; font-weight: bold; background: #00e676;
    color: #000; border: none; border-radius: 6px; cursor: pointer; width: 100%;
  }
  button:hover { background: #00c853; }
  #hud {
    position: absolute; bottom: 15px; left: 15px; background: rgba(0,0,0,0.6);
    padding: 10px 15px; border-radius: 8px; font-size: 18px; font-weight: bold; display: none;
  }
  #leaderboard {
    position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6);
    padding: 12px 18px; border-radius: 8px; min-width: 160px; display: none;
  }
</style>
</head>
<body>
<div id="menu">
  <h2 style="margin-top:0; color:#00e676;">OMERIXXS ÖZEL SUNUCU</h2>
  <input type="text" id="nick" placeholder="Oyuncu Adın..." maxlength="15" value="Omer"><br>
  <button onclick="startGame()">OYNA</button>
  <p style="font-size:12px; color:#aaa; margin-top:15px;">Hareket: Fare | Hızlan: Boşluk (Space)</p>
</div>
<div id="hud">Skor: <span id="score">20</span></div>
<div id="leaderboard"><b>Liderlik Tablosu</b><div id="lb-list"></div></div>
<canvas id="game"></canvas>

<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.onresize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
let ws = null;

let myId = null;
let players = {};
let foods = [];
let mapSize = 3000;
let mouseX = 0, mouseY = 0;
let playing = false;

function startGame() {
  const name = document.getElementById('nick').value || 'Oyuncu';
  
  ws = new WebSocket(protocol + '//' + location.host);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', name: name }));
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'block';
    playing = true;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'init') {
      myId = data.id;
      mapSize = data.mapSize;
    } else if (data.type === 'state') {
      players = data.players;
      foods = data.foods;
      updateUI();
    }
  };

  ws.onclose = () => {
    playing = false;
    document.getElementById('menu').style.display = 'block';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
  };
}

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX - canvas.width / 2;
  mouseY = e.clientY - canvas.height / 2;
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && playing && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'boost' }));
  }
});

setInterval(() => {
  if (playing && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'move', dx: mouseX, dy: mouseY }));
  }
}, 40);

function updateUI() {
  if (players[myId]) {
    document.getElementById('score').innerText = Math.floor(players[myId].r);
  }
  const sorted = Object.values(players).sort((a, b) => b.r - a.r).slice(0, 5);
  document.getElementById('lb-list').innerHTML = sorted.map((p, i) => 
    '<div>' + (i + 1) + '. ' + p.name + ' (' + Math.floor(p.r) + ')</div>'
  ).join('');
}

function draw() {
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const me = players[myId];
  const camX = me ? me.x : mapSize / 2;
  const camY = me ? me.y : mapSize / 2;

  ctx.save();
  ctx.translate(canvas.width / 2 - camX, canvas.height / 2 - camY);

  // Izgara çizimi
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  for (let x = 0; x <= mapSize; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mapSize); ctx.stroke();
  }
  for (let y = 0; y <= mapSize; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mapSize, y); ctx.stroke();
  }

  // Harita sınırı
  ctx.strokeStyle = '#ff1744';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, mapSize, mapSize);

  // Yemler
  foods.forEach(f => {
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Oyuncular
  Object.values(players).forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + Math.max(14, p.r / 2.5) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.name, p.x, p.y);
  });

  ctx.restore();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(htmlPage);
});

const wss = new WebSocket.Server({ server });

const MAP_SIZE = 3000;
let players = {};
let foods = [];
const colors = ['#00e676', '#2979ff', '#ff1744', '#ffea00', '#d500f9', '#00e5ff'];

for (let i = 0; i < 150; i++) {
  foods.push({
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    color: colors[Math.floor(Math.random() * colors.length)]
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
          speedBoost: 0,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      } else if (data.type === 'move' && players[id]) {
        players[id].dx = data.dx;
        players[id].dy = data.dy;
      } else if (data.type === 'boost' && players[id] && players[id].r > 30) {
        players[id].r -= 2;
        players[id].speedBoost = 12;
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    delete players[id];
  });
});

setInterval(() => {
  const playerIds = Object.keys(players);

  playerIds.forEach(id => {
    const p = players[id];
    const dist = Math.hypot(p.dx, p.dy);
    if (dist > 5) {
      let speed = Math.max(2, 6 - p.r * 0.02);
      if (p.speedBoost > 0) {
        speed *= 2;
        p.speedBoost--;
      }
      p.x += (p.dx / dist) * speed;
      p.y += (p.dy / dist) * speed;
    }
    p.x = Math.max(p.r, Math.min(MAP_SIZE - p.r, p.x));
    p.y = Math.max(p.r, Math.min(MAP_SIZE - p.r, p.y));

    // Yem yeme kontrolü
    for (let i = foods.length - 1; i >= 0; i--) {
      if (Math.hypot(p.x - foods[i].x, p.y - foods[i].y) < p.r) {
        p.r += 0.5;
        foods[i] = {
          x: Math.random() * MAP_SIZE,
          y: Math.random() * MAP_SIZE,
          color: colors[Math.floor(Math.random() * colors.name ? 0 : Math.floor(Math.random() * colors.length))]
        };
      }
    }

    // Oyuncu yeme kontrolü
    playerIds.forEach(otherId => {
      if (id !== otherId && players[otherId]) {
        const other = players[otherId];
        if (p.r > other.r * 1.15 && Math.hypot(p.x - other.x, p.y - other.y) < p.r) {
          p.r += other.r * 0.4;
          delete players[otherId];
        }
      }
    });
  });

  const payload = JSON.stringify({ type: 'state', players, foods });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}, 33);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Oyun sunucusu calisiyor: ' + PORT);
});
