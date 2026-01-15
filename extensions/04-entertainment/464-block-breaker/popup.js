const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let paddle = { x: 125, y: 330, w: 60, h: 10 };
let ball = { x: 150, y: 300, r: 6, dx: 3, dy: -3 };
let blocks = [], score = 0, best = 0, gameOver = false;
const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];

chrome.storage.local.get(['blockBest'], r => { best = r.blockBest || 0; document.getElementById('best').textContent = best; });

function initBlocks() {
  blocks = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      blocks.push({ x: col * 48 + 8, y: row * 20 + 30, w: 44, h: 16, color: colors[row], alive: true });
    }
  }
}

function update() {
  if (gameOver) return;
  ball.x += ball.dx; ball.y += ball.dy;
  if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.dx *= -1;
  if (ball.y - ball.r < 0) ball.dy *= -1;
  if (ball.y + ball.r > canvas.height) { gameOver = true; return; }
  if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
    ball.dy = -Math.abs(ball.dy);
    ball.dx = (ball.x - (paddle.x + paddle.w / 2)) / 10;
  }
  blocks.forEach(b => {
    if (b.alive && ball.x > b.x && ball.x < b.x + b.w && ball.y - ball.r < b.y + b.h && ball.y + ball.r > b.y) {
      b.alive = false; ball.dy *= -1; score += 10;
      document.getElementById('score').textContent = score;
      if (score > best) { best = score; chrome.storage.local.set({ blockBest: best }); document.getElementById('best').textContent = best; }
    }
  });
  if (blocks.every(b => !b.alive)) { initBlocks(); ball.dx *= 1.1; ball.dy *= 1.1; }
}

function draw() {
  ctx.fillStyle = '#0f0f23'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.w, paddle.y);
  grad.addColorStop(0, '#ff6b6b'); grad.addColorStop(1, '#feca57');
  ctx.fillStyle = grad; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
  blocks.forEach(b => { if (b.alive) { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); } });
  if (gameOver) { ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.fillText('Game Over!', 95, 180); ctx.font = '14px sans-serif'; ctx.fillText('Click to restart', 100, 210); }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

canvas.addEventListener('mousemove', e => { const rect = canvas.getBoundingClientRect(); paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, e.clientX - rect.left - paddle.w / 2)); });
canvas.addEventListener('click', () => { if (gameOver) { gameOver = false; score = 0; document.getElementById('score').textContent = 0; ball = { x: 150, y: 300, r: 6, dx: 3, dy: -3 }; initBlocks(); } });

initBlocks(); gameLoop();
