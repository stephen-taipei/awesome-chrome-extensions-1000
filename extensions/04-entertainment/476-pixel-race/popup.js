const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 280, H = 320;
let player = { x: 130, y: 260 }, obstacles = [], score = 0, best = 0, speed = 3, gameOver = false;
let keys = {};

function init() {
  chrome.storage.local.get(['pixelRaceBest'], (r) => {
    best = r.pixelRaceBest || 0;
    document.getElementById('best').textContent = best;
  });
  reset();
  document.addEventListener('keydown', (e) => { keys[e.key] = true; if (gameOver && e.key === ' ') reset(); });
  document.addEventListener('keyup', (e) => keys[e.key] = false);
  gameLoop();
}

function reset() {
  player = { x: 130, y: 260 };
  obstacles = [];
  score = 0; speed = 3; gameOver = false;
  document.getElementById('score').textContent = '0';
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (gameOver) return;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= 5;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += 5;
  player.x = Math.max(40, Math.min(220, player.x));
  if (Math.random() < 0.03) {
    obstacles.push({ x: 40 + Math.random() * 180, y: -20, w: 20, h: 30 });
  }
  obstacles.forEach(o => o.y += speed);
  obstacles = obstacles.filter(o => o.y < H);
  obstacles.forEach(o => {
    if (player.x < o.x + o.w && player.x + 20 > o.x && player.y < o.y + o.h && player.y + 30 > o.y) {
      gameOver = true;
      if (score > best) { best = score; chrome.storage.local.set({ pixelRaceBest: best }); document.getElementById('best').textContent = best; }
    }
  });
  score++;
  document.getElementById('score').textContent = score;
  if (score % 200 === 0) speed += 0.5;
}

function draw() {
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#333'; ctx.fillRect(30, 0, 220, H);
  ctx.strokeStyle = '#ffff00'; ctx.setLineDash([20, 20]);
  ctx.beginPath(); ctx.moveTo(140, 0); ctx.lineTo(140, H); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#3a7bd5';
  ctx.fillRect(player.x, player.y, 20, 30);
  ctx.fillStyle = '#00d2ff';
  ctx.fillRect(player.x + 2, player.y + 5, 6, 8);
  ctx.fillRect(player.x + 12, player.y + 5, 6, 8);
  ctx.fillStyle = '#e74c3c';
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(o.x + 2, o.y + 5, 6, 6);
    ctx.fillRect(o.x + 12, o.y + 5, 6, 6);
    ctx.fillStyle = '#e74c3c';
  });
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W/2, H/2 - 20);
    ctx.font = '14px sans-serif';
    ctx.fillText('Press SPACE to restart', W/2, H/2 + 20);
  }
}

init();
