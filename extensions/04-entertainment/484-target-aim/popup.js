document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('best');
  const startBtn = document.getElementById('start-game');

  let score = 0, best = 0, timeLeft = 30, targets = [], gameRunning = false, timer = null;

  const loadBest = () => chrome.storage.local.get(['targetAimBest'], r => { best = r.targetAimBest || 0; bestEl.textContent = best; });
  const saveBest = () => { if (score > best) { best = score; chrome.storage.local.set({ targetAimBest: best }); bestEl.textContent = best; } };

  const spawnTarget = () => {
    const size = 20 + Math.random() * 30;
    const speed = 1 + Math.random() * 2;
    const dir = Math.random() > 0.5 ? 1 : -1;
    targets.push({ x: Math.random() * (300 - size), y: Math.random() * (280 - size), size, vx: speed * dir, vy: (Math.random() - 0.5) * 2, points: Math.round(50 - size) + 30 });
  };

  const draw = () => {
    ctx.clearRect(0, 0, 320, 340);
    targets.forEach(t => {
      ctx.beginPath();
      ctx.arc(t.x + t.size/2, t.y + t.size/2, t.size/2, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4757'; ctx.fill();
      ctx.beginPath();
      ctx.arc(t.x + t.size/2, t.y + t.size/2, t.size/3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath();
      ctx.arc(t.x + t.size/2, t.y + t.size/2, t.size/6, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4757'; ctx.fill();
    });
    if (!gameRunning) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, 320, 340);
      ctx.fillStyle = '#fff'; ctx.font = '20px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText(timeLeft === 30 ? 'Click Start to Play!' : `Game Over! Score: ${score}`, 160, 170);
    }
  };

  const update = () => {
    if (!gameRunning) return;
    targets.forEach(t => {
      t.x += t.vx; t.y += t.vy;
      if (t.x <= 0 || t.x >= 320 - t.size) t.vx *= -1;
      if (t.y <= 0 || t.y >= 340 - t.size) t.vy *= -1;
    });
    while (targets.length < 5) spawnTarget();
    draw(); requestAnimationFrame(update);
  };

  canvas.addEventListener('click', e => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      const dx = mx - (t.x + t.size/2), dy = my - (t.y + t.size/2);
      if (Math.sqrt(dx*dx + dy*dy) < t.size/2) {
        score += t.points; scoreEl.textContent = score;
        targets.splice(i, 1); break;
      }
    }
  });

  const startGame = () => {
    score = 0; timeLeft = 30; targets = []; gameRunning = true;
    scoreEl.textContent = 0; timeEl.textContent = 30;
    startBtn.disabled = true;
    for (let i = 0; i < 5; i++) spawnTarget();
    timer = setInterval(() => {
      timeLeft--; timeEl.textContent = timeLeft;
      if (timeLeft <= 0) { clearInterval(timer); gameRunning = false; saveBest(); startBtn.disabled = false; draw(); }
    }, 1000);
    update();
  };

  startBtn.addEventListener('click', startGame);
  loadBest(); draw();
});
