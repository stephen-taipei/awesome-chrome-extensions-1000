const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let player = { x: 50, y: 200, size: 20, vy: 0 };
let gravity = 0.5, gravityDir = 1, score = 0, best = 0, gameOver = false;
let obstacles = [];

chrome.storage.local.get(['gravityBest'], r => { best = r.gravityBest || 0; document.getElementById('best').textContent = best; });

function spawnObstacle() {
  const gap = 120, gapY = Math.random() * (canvas.height - gap - 40) + 20;
  obstacles.push({ x: canvas.width, gapY, gap, passed: false });
}

function update() {
  if (gameOver) return;
  player.vy += gravity * gravityDir;
  player.y += player.vy;
  if (player.y < 0 || player.y + player.size > canvas.height) endGame();
  obstacles.forEach(o => {
    o.x -= 3;
    if (!o.passed && o.x + 30 < player.x) { o.passed = true; score++; document.getElementById('score').textContent = score; }
    if (player.x + player.size > o.x && player.x < o.x + 30) {
      if (player.y < o.gapY || player.y + player.size > o.gapY + o.gap) endGame();
    }
  });
  obstacles = obstacles.filter(o => o.x > -40);
  if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 150) spawnObstacle();
}

function draw() {
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(player.x, player.y, player.x + player.size, player.y + player.size);
  grad.addColorStop(0, '#00d9ff'); grad.addColorStop(1, '#00ff88');
  ctx.fillStyle = grad; ctx.fillRect(player.x, player.y, player.size, player.size);
  obstacles.forEach(o => {
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(o.x, 0, 30, o.gapY);
    ctx.fillRect(o.x, o.gapY + o.gap, 30, canvas.height - o.gapY - o.gap);
  });
  if (gameOver) { ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif'; ctx.fillText('Game Over!', 90, 200); ctx.font = '14px sans-serif'; ctx.fillText('Click to restart', 105, 230); }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

function endGame() {
  gameOver = true;
  if (score > best) { best = score; chrome.storage.local.set({ gravityBest: best }); document.getElementById('best').textContent = best; }
}

function reset() { player = { x: 50, y: 200, size: 20, vy: 0 }; gravity = 0.5; gravityDir = 1; score = 0; gameOver = false; obstacles = []; document.getElementById('score').textContent = 0; }

canvas.addEventListener('click', () => { if (gameOver) reset(); else gravityDir *= -1; });
spawnObstacle(); gameLoop();
