const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const path = [{x:0,y:175},{x:60,y:175},{x:60,y:50},{x:180,y:50},{x:180,y:280},{x:100,y:280},{x:100,y:175},{x:240,y:175},{x:240,y:330},{x:300,y:330}];
let towers = [], enemies = [], bullets = [], gold = 100, lives = 10, wave = 1, placing = false, waveActive = false;

chrome.storage.local.get(['towerBest'], r => { if (r.towerBest > wave) document.getElementById('wave').textContent = `${wave} (Best: ${r.towerBest})`; });

function drawPath() {
  ctx.strokeStyle = '#333'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  path.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.stroke();
}

function spawnWave() {
  waveActive = true;
  for (let i = 0; i < wave * 3 + 2; i++) {
    setTimeout(() => enemies.push({ x: -20, y: 175, hp: 20 + wave * 5, maxHp: 20 + wave * 5, pathIdx: 0, speed: 1 + wave * 0.1 }), i * 600);
  }
}

function update() {
  enemies.forEach(e => {
    if (e.pathIdx < path.length) {
      const target = path[e.pathIdx];
      const dx = target.x - e.x, dy = target.y - e.y, dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < e.speed) { e.pathIdx++; } else { e.x += (dx/dist) * e.speed; e.y += (dy/dist) * e.speed; }
    }
  });
  enemies = enemies.filter(e => {
    if (e.pathIdx >= path.length) { lives--; document.getElementById('lives').textContent = lives; return false; }
    if (e.hp <= 0) { gold += 10; document.getElementById('gold').textContent = gold; return false; }
    return true;
  });
  towers.forEach(t => {
    t.cooldown = Math.max(0, t.cooldown - 1);
    if (t.cooldown === 0) {
      const target = enemies.find(e => Math.sqrt((e.x-t.x)**2 + (e.y-t.y)**2) < 80);
      if (target) { bullets.push({ x: t.x, y: t.y, target, dmg: 10 }); t.cooldown = 30; }
    }
  });
  bullets.forEach(b => {
    const dx = b.target.x - b.x, dy = b.target.y - b.y, dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 5) { b.target.hp -= b.dmg; b.hit = true; } else { b.x += (dx/dist) * 5; b.y += (dy/dist) * 5; }
  });
  bullets = bullets.filter(b => !b.hit);
  if (waveActive && enemies.length === 0) { waveActive = false; wave++; document.getElementById('wave').textContent = wave; chrome.storage.local.set({ towerBest: wave }); }
  if (lives <= 0) { alert('Game Over! Reached wave ' + wave); location.reload(); }
}

function draw() {
  ctx.fillStyle = '#0a0a15'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPath();
  towers.forEach(t => { ctx.fillStyle = '#fdcb6e'; ctx.beginPath(); ctx.arc(t.x, t.y, 15, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = 'rgba(253,203,110,0.2)'; ctx.beginPath(); ctx.arc(t.x, t.y, 80, 0, Math.PI*2); ctx.stroke(); });
  enemies.forEach(e => { ctx.fillStyle = '#ff7675'; ctx.beginPath(); ctx.arc(e.x, e.y, 10, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#2ecc71'; ctx.fillRect(e.x-12, e.y-18, 24*(e.hp/e.maxHp), 4); });
  bullets.forEach(b => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI*2); ctx.fill(); });
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

canvas.addEventListener('click', e => {
  if (!placing) return;
  if (gold < 50) return;
  const rect = canvas.getBoundingClientRect();
  towers.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, cooldown: 0 });
  gold -= 50; document.getElementById('gold').textContent = gold;
  placing = false; document.getElementById('towerBtn').textContent = 'Place Tower (50g)';
});

document.getElementById('towerBtn').addEventListener('click', () => { placing = !placing; document.getElementById('towerBtn').textContent = placing ? 'Click to place...' : 'Place Tower (50g)'; });
document.getElementById('startBtn').addEventListener('click', () => { if (!waveActive) spawnWave(); });

gameLoop();
