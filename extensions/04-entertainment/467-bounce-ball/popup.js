const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let paddle = { x: 125, y: 360, w: 60, h: 10 };
let ball = { x: 150, y: 200, r: 10, dx: 3, dy: 3 };
let score = 0, best = 0, gameOver = false, powerups = [];

chrome.storage.local.get(['bounceBest'], r => { best = r.bounceBest || 0; document.getElementById('best').textContent = best; });

function spawnPowerup() {
  if (Math.random() < 0.02 && powerups.length < 3) {
    powerups.push({ x: Math.random() * 260 + 20, y: 0, type: Math.random() < 0.5 ? 'grow' : 'slow' });
  }
}

function update() {
  if (gameOver) return;
  ball.x += ball.dx; ball.y += ball.dy;
  if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.dx *= -1;
  if (ball.y - ball.r < 0) ball.dy = Math.abs(ball.dy);
  if (ball.y + ball.r > canvas.height) { gameOver = true; return; }
  if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.dy > 0) {
    ball.dy = -Math.abs(ball.dy);
    ball.dx += (ball.x - (paddle.x + paddle.w / 2)) / 15;
    score++;
    document.getElementById('score').textContent = score;
    if (score > best) { best = score; chrome.storage.local.set({ bounceBest: best }); document.getElementById('best').textContent = best; }
    if (score % 5 === 0) { ball.dx *= 1.05; ball.dy *= 1.05; }
  }
  spawnPowerup();
  powerups.forEach((p, i) => {
    p.y += 2;
    if (p.y > canvas.height) powerups.splice(i, 1);
    else if (p.x > paddle.x && p.x < paddle.x + paddle.w && p.y > paddle.y - 10 && p.y < paddle.y + paddle.h) {
      if (p.type === 'grow') paddle.w = Math.min(100, paddle.w + 10);
      else { ball.dx *= 0.8; ball.dy *= 0.8; }
      powerups.splice(i, 1);
    }
  });
}

function draw() {
  ctx.fillStyle = '#0f0f23'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const pGrad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.w, paddle.y);
  pGrad.addColorStop(0, '#00b894'); pGrad.addColorStop(1, '#00cec9');
  ctx.fillStyle = pGrad; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  const bGrad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.r);
  bGrad.addColorStop(0, '#fff'); bGrad.addColorStop(1, '#00cec9');
  ctx.fillStyle = bGrad; ctx.fill();
  powerups.forEach(p => { ctx.fillStyle = p.type === 'grow' ? '#f9ca24' : '#74b9ff'; ctx.fillRect(p.x - 8, p.y - 8, 16, 16); });
  if (gameOver) { ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.fillText('Game Over!', 100, 180); ctx.font = '14px sans-serif'; ctx.fillText('Click to restart', 105, 210); }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

canvas.addEventListener('mousemove', e => { const rect = canvas.getBoundingClientRect(); paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, e.clientX - rect.left - paddle.w / 2)); });
canvas.addEventListener('click', () => { if (gameOver) { gameOver = false; score = 0; paddle.w = 60; ball = { x: 150, y: 200, r: 10, dx: 3, dy: 3 }; powerups = []; document.getElementById('score').textContent = 0; } });

gameLoop();
