document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const levelEl = document.getElementById('level');
  const scoreEl = document.getElementById('score');
  const newGameBtn = document.getElementById('new-game');

  let level = 1, score = 0, ropes = [], items = [], targets = [], gravity = 0.3;

  const loadGame = () => chrome.storage.local.get(['ropeCutLevel', 'ropeCutScore'], r => {
    level = r.ropeCutLevel || 1; score = r.ropeCutScore || 0;
    levelEl.textContent = level; scoreEl.textContent = score; setupLevel();
  });

  const saveGame = () => chrome.storage.local.set({ ropeCutLevel: level, ropeCutScore: score });

  const setupLevel = () => {
    ropes = []; items = []; targets = [];
    const ropeCount = Math.min(1 + Math.floor(level / 2), 3);
    for (let i = 0; i < ropeCount; i++) {
      const x = 60 + i * 100;
      ropes.push({ x1: x, y1: 20, x2: x, y2: 80 + Math.random() * 40, cut: false });
    }
    items.push({ x: ropes[0].x2, y: ropes[0].y2, vx: 0, vy: 0, falling: false, collected: false, radius: 15 });
    targets.push({ x: 100 + Math.random() * 120, y: 300, width: 50, height: 30 });
  };

  const draw = () => {
    ctx.clearRect(0, 0, 320, 350);
    targets.forEach(t => {
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(t.x, t.y, t.width, t.height);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(t.x + 5, t.y + 5, t.width - 10, t.height - 10);
    });
    ropes.forEach(r => {
      if (!r.cut) {
        ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2);
        ctx.strokeStyle = '#c0a080'; ctx.lineWidth = 4; ctx.stroke();
      }
    });
    items.forEach(item => {
      if (!item.collected) {
        ctx.beginPath(); ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeaa7'; ctx.fill();
        ctx.strokeStyle = '#fdcb6e'; ctx.lineWidth = 2; ctx.stroke();
      }
    });
  };

  const update = () => {
    items.forEach(item => {
      if (item.falling && !item.collected) {
        item.vy += gravity; item.y += item.vy; item.x += item.vx;
        if (item.x < 15 || item.x > 305) item.vx *= -0.8;
        targets.forEach(t => {
          if (item.x > t.x && item.x < t.x + t.width && item.y > t.y && item.y < t.y + t.height) {
            item.collected = true; score += 100 * level; level++;
            scoreEl.textContent = score; levelEl.textContent = level;
            saveGame(); setTimeout(setupLevel, 500);
          }
        });
        if (item.y > 360) { item.collected = true; setTimeout(setupLevel, 500); }
      }
    });
    draw(); requestAnimationFrame(update);
  };

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    ropes.forEach((r, i) => {
      if (!r.cut) {
        const dist = Math.abs((r.y2-r.y1)*mx - (r.x2-r.x1)*my + r.x2*r.y1 - r.y2*r.x1) /
                     Math.sqrt((r.y2-r.y1)**2 + (r.x2-r.x1)**2);
        if (dist < 15 && my > r.y1 && my < r.y2) {
          r.cut = true;
          if (items[i]) { items[i].falling = true; items[i].vx = (Math.random() - 0.5) * 2; }
        }
      }
    });
  });

  newGameBtn.addEventListener('click', () => { level = 1; score = 0; levelEl.textContent = 1; scoreEl.textContent = 0; saveGame(); setupLevel(); });
  loadGame(); update();
});
