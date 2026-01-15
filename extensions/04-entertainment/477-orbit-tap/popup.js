const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CX = 140, CY = 140, R = 100;
let angle = 0, speed = 0.03, targetAngle = 0, score = 0, best = 0, lives = 3;

function init() {
  chrome.storage.local.get(['orbitTapBest'], (r) => {
    best = r.orbitTapBest || 0;
    document.getElementById('best').textContent = best;
  });
  newTarget();
  gameLoop();
}

function newTarget() {
  targetAngle = Math.random() * Math.PI * 2;
}

function gameLoop() {
  angle += speed;
  if (angle > Math.PI * 2) angle -= Math.PI * 2;
  draw();
  requestAnimationFrame(gameLoop);
}

function draw() {
  ctx.clearRect(0, 0, 280, 280);
  ctx.strokeStyle = '#2c5364'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#00ff88'; ctx.beginPath();
  const tx = CX + Math.cos(targetAngle) * R, ty = CY + Math.sin(targetAngle) * R;
  ctx.arc(tx, ty, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2709c'; ctx.beginPath();
  const ox = CX + Math.cos(angle) * R, oy = CY + Math.sin(angle) * R;
  ctx.arc(ox, oy, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff9472'; ctx.beginPath();
  ctx.arc(CX, CY, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
  for (let i = 0; i < lives; i++) ctx.fillText('♥', 130 + i * 20, 270);
}

function tap() {
  const diff = Math.abs(angle - targetAngle);
  const hit = diff < 0.3 || diff > Math.PI * 2 - 0.3;
  if (hit) {
    score += 10;
    speed += 0.005;
    document.getElementById('score').textContent = score;
    newTarget();
    if (score > best) {
      best = score;
      chrome.storage.local.set({ orbitTapBest: best });
      document.getElementById('best').textContent = best;
    }
  } else {
    lives--;
    if (lives <= 0) {
      lives = 3; score = 0; speed = 0.03;
      document.getElementById('score').textContent = '0';
    }
  }
}

document.getElementById('tap').addEventListener('click', tap);
document.addEventListener('keydown', (e) => { if (e.code === 'Space') tap(); });
init();
