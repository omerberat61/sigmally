const http = require('http');
const WebSocket = require('ws');

const htmlPage = `<!DOCTYPE html>
<html lang="tr" style="--sigmod-theme-background: linear-gradient(135deg, #090713 0%, #211442 38%, #4b2371 72%, #72418e 100%); --sigmod-theme-text: #FFFFFF; --sigmod-theme-surface: rgba(0, 0, 0, 0.45); --sigmod-theme-surface-strong: rgba(18, 18, 30, 0.95); --sigmod-theme-border: rgba(255, 255, 255, 0.15); --sigmod-shop-card-border: #4ab3ff;">
<head>
<meta charset="UTF-8">
<title>Sigmally - SigMod v11.0.1 by Cursed</title>
<style>
  body { 
    margin: 0; overflow: hidden; 
    background: var(--sigmod-theme-background, #0b0b14); 
    font-family: 'Segoe UI', Arial, sans-serif; 
    color: var(--sigmod-theme-text, #ffffff); 
  }
  canvas { display: block; }
  
  /* Üst SigMod Bar */
  #sigmod-bar {
    position: absolute; top: 0; left: 0; width: 100%; height: 35px;
    background: rgba(0, 0, 0, 0.7); border-bottom: 1px solid var(--sigmod-theme-border);
    display: flex; align-items: center; justify-content: space-between; padding: 0 15px;
    box-sizing: border-box; font-size: 13px; z-index: 20;
  }
  #sigmod-bar span { color: #c77dff; font-weight: bold; }

  /* Ana Menü */
  #menu {
    position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%);
    background: var(--sigmod-theme-surface-strong); 
    padding: 25px; border-radius: 16px;
    box-shadow: 0 0 40px rgba(138, 43, 226, 0.5); 
    border: 1px solid var(--sigmod-theme-border);
    width: 380px; z-index: 10;
  }
  .menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  h2 { color: #b19cd9; margin: 0; font-size: 22px; letter-spacing: 1px; }
  .sigmod-badge {
    background: linear-gradient(135deg, #7b2cbf, #9d4edd); color: #fff;
    font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: bold;
  }
  
  /* Sekmeler (Genel / Grup vb.) */
  .tabs { display: flex; gap: 5px; margin-bottom: 12px; }
  .tab-btn {
    flex: 1; padding: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--sigmod-theme-border);
    color: #fff; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; text-align: center;
  }
  .tab-btn.active { background: #7b2cbf; border-color: #9d4edd; }

  input {
    padding: 12px; font-size: 15px; border-radius: 8px; border: 1px solid #443366;
    outline: none; width: 100%; box-sizing: border-box; text-align: center; margin-bottom: 10px; 
    background: var(--sigmod-theme-surface); color: #fff;
  }
  
  .btn-main {
    padding: 12px; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #2ec4b6, #25a18e);
    color: #fff; border: none; border-radius: 8px; cursor: pointer; width: 100%;
    box-shadow: 0 4px 15px rgba(46, 196, 182, 0.4); margin-bottom: 8px; transition: 0.2s;
  }
  .btn-main:hover { opacity: 0.9; transform: translateY(-1px); }

  /* SigMod Ayar Paneli */
  #sigmod-settings-panel {
    background: rgba(0,0,0,0.3); border: 1px solid var(--sigmod-theme-border);
    border-radius: 8px; padding: 10px; margin-top: 10px; font-size: 12px;
  }
  .setting-row { display: flex; justify-content: space-between; align-items: center; margin: 6px 0; }
  .setting-row input[type="checkbox"] { width: auto; margin: 0; cursor: pointer; }

  #hud {
    position: absolute; bottom: 20px; left: 20px; background: var(--sigmod-theme-surface-strong);
    padding: 12px 20px; border-radius: 10px; font-size: 18px; font-weight: bold; 
    border: 1px solid var(--sigmod-theme-border); display: none; z-index: 10;
  }
  #leaderboard {
    position: absolute; top: 50px; right: 20px; background: var(--sigmod-theme-surface-strong);
    padding: 15px; border-radius: 10px; min-width: 180px; 
    border: 1px solid var(--sigmod-theme-border); display: none; z-index: 10;
  }
  #leaderboard b { color: #c77dff; display: block; margin-bottom: 8px; text-align: center; }
</style>
</head>
<body>

<div id="sigmod-bar">
  <div><b>SigMod v11.0.1</b> by Cursed | <span style="color:#00e676">Aktif</span></div>
  <div>Omerixxs Özel Sunucu</div>
</div>

<div id="menu">
  <div class="menu-header">
    <h2>Sigmally</h2>
    <span class="sigmod-badge">SigMod v11.0.1</span>
  </div>

  <div class="tabs">
    <div class="tab-btn active">Genel</div>
    <div class="tab-btn" onclick="alert('Grup sistemi aktif!')">Grup</div>
  </div>

  <input type="text" id="nick" placeholder="Oyuncu Adın..." maxlength="15" value="Omerixxs">
  
  <button class="btn-main" onclick="startGame()">Oynamak</button>
  
  <!-- SigMod Gelişmiş Ayarlar Paneli -->
  <div id="sigmod-settings-panel">
    <b>SigMod Mod Ayarları</b>
    <div class="setting-row">
      <label>Oto-Besleme (Macro W)</label>
      <input type="checkbox" id="opt-macro">
    </div>
    <div class="setting-row">
      <label>Renk Efektleri (Glow)</label>
      <input type="checkbox" id="opt-glow" checked>
    </div>
    <div class="setting-row">
      <label>Gelişmiş Kamera Zoom</label>
      <input type="checkbox" id="opt-zoom" checked>
    </div>
  </div>
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
let viruses = [];
let mapSize = 3000;
let mouseX = 0, mouseY = 0;
let playing = false;
let currentZoom = 1;
let macroInterval = null;

function startGame() {
  const name = document.getElementById('nick').value || 'Oyuncu';
  ws = new WebSocket(protocol + '//' + location.host);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', name: name }));
    document.getElementById('menu').style.display = 'none';
    document.getElementById('sigmod-bar').style.display = 'none';
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
      viruses = data.viruses || [];
      updateUI();
    }
  };

  ws.onclose = () => {
    playing = false;
    document.getElementById('menu').style.display = 'block';
    document.getElementById('sigmod-bar').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
    if (macroInterval) clearInterval(macroInterval);
  };
}

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - canvas.width / 2) / currentZoom;
  mouseY = (e.clientY - canvas.height / 2) / currentZoom;
});

window.addEventListener('keydown', (e) => {
  if (!playing || !ws || ws.readyState !== WebSocket.OPEN) return;
  if (e.code === 'Space') {
    ws.send(JSON.stringify({ type: 'split' }));
  } else if (e.code === 'KeyW') {
    ws.send(JSON.stringify({ type: 'eject' }));
  }
});

// SigMod Macro W (Basılı tutunca seri yem atma)
window.addEventListener('mousedown', (e) => {
  if (!playing || !ws || ws.readyState !== WebSocket.OPEN) return;
  if (e.button === 2 && document.getElementById('opt-macro').checked) { // Sağ tık macro
    macroInterval = setInterval(() => {
      ws.send(JSON.stringify({ type: 'eject' }));
    }, 50);
  }
});
window.addEventListener('mouseup', (e) => {
  if (e.button === 2 && macroInterval) {
    clearInterval(macroInterval);
    macroInterval = null;
  }
});
window.addEventListener('contextmenu', e => e.preventDefault()); // Sağ tık menüsünü kapat

setInterval(() => {
  if (playing && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'move', dx: mouseX, dy: mouseY }));
  }
}, 30);

function updateUI() {
  if (players[myId]) {
    document.getElementById('score').innerText = Math.floor(players[myId].r);
  }
  const sorted = Object.values(players).sort((a, b) => b.r - a.r).slice(0, 5);
  document.getElementById('lb-list').innerHTML = sorted.map((p, i) => 
    '<div style="margin: 4px 0;">' + (i + 1) + '. ' + p.name + ' <span style="float:right; color:#b19cd9;">' + Math.floor(p.r) + '</span></div>'
  ).join('');
}

function draw() {
  ctx.fillStyle = '#0b0b14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const me = players[myId];
  const camX = me ? me.x : mapSize / 2;
  const camY = me ? me.y : mapSize / 2;

  let useZoom = document.getElementById('opt-zoom').checked;
  let targetZoom = (useZoom && me) ? Math.min(1, Math.max(0.3, 40 / me.r)) : 1;
  currentZoom += (targetZoom - currentZoom) * 0.1;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(currentZoom, currentZoom);
  ctx.translate(-camX, -camY);

  ctx.strokeStyle = '#151525';
  ctx.lineWidth = 1;
  for (let x = 0; x <= mapSize; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mapSize); ctx.stroke();
  }
  for (let y = 0; y <= mapSize; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mapSize, y); ctx.stroke();
  }

  ctx.strokeStyle = '#7b2cbf';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, mapSize, mapSize);

  foods.forEach(f => {
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  viruses.forEach(v => {
    ctx.fillStyle = '#38b000';
    ctx.strokeStyle = '#007200';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  let useGlow = document.getElementById('opt-glow').checked;

  Object.values(players).forEach(p => {
    ctx.save();
    if (useGlow) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
    }

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + Math.max(13, p.r / 2.5) + 'px Segoe UI';
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
      } else if (data.type === 'move' && players[id]) {
        players[id].dx = data.dx;
        players[id].dy = data.dy;
      } else if (data.type === 'split' && players[id] && players[id].r > 35) {
        players[id].r *= 0.75;
      } else if (data.type === 'eject' && players[id] && players[id].r > 28) {
        players[id].r -= 1;
        foods.push({
          x: players[id].x + (players[id].dx / Math.hypot(players[id].dx, players[id].dy || 1)) * (players[id].r + 15),
          y: players[id].y + (players[id].dy / Math.hypot(players[id].dx, players[id].dy || 1)) * (players[id].r + 15),
          color: players[id].color
        });
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
      let speed = Math.max(1.8, 5.5 - p.r * 0.02);
      p.x += (p.dx / dist) * speed;
      p.y += (p.dy / dist) * speed;
    }
    p.x = Math.max(p.r, Math.min(MAP_SIZE - p.r, p.x));
    p.y = Math.max(p.r, Math.min(MAP_SIZE - p.r, p.y));

    for (let i = foods.length - 1; i >= 0; i--) {
      if (Math.hypot(p.x - foods[i].x, p.y - foods[i].y) < p.r) {
        p.r += 0.4;
        foods[i] = {
          x: Math.random() * MAP_SIZE,
          y: Math.random() * MAP_SIZE,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      }
    }

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

  const payload = JSON.stringify({ type: 'state', players, foods, viruses });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}, 33);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Tam donanimli SigMod sunucusu calisiyor: ' + PORT);
});
