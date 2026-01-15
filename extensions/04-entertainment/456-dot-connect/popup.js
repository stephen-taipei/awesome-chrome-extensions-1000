const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let dots = [], lines = [], currentDot = 0, level = 1, best = 0;

chrome.storage.local.get(['dotConnectBest'], (r) => {
  best = r.dotConnectBest || 0;
  document.getElementById('best').textContent = best;
});

function generateDots() {
  dots = []; lines = []; currentDot = 0;
  const count = 4 + level;
  for (let i = 0; i < count; i++) {
    dots.push({ x: 30 + Math.random() * 220, y: 30 + Math.random() * 220, num: i + 1 });
  }
  draw();
}

function draw() {
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(0, 0, 280, 280);
  ctx.strokeStyle = '#00d9ff';
  ctx.lineWidth = 2;
  lines.forEach(l => {
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x2, l.y2);
    ctx.stroke();
  });
  dots.forEach((d, i) => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = i < currentDot ? '#00d9ff' : i === currentDot ? '#ff6b6b' : '#2a2a4a';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.num, d.x, d.y);
  });
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const d = dots[currentDot];
  if (Math.hypot(x - d.x, y - d.y) < 20) {
    if (currentDot > 0) {
      const prev = dots[currentDot - 1];
      lines.push({ x1: prev.x, y1: prev.y, x2: d.x, y2: d.y });
    }
    currentDot++;
    if (currentDot === dots.length) {
      document.getElementById('message').textContent = 'Level Complete!';
      level++;
      document.getElementById('level').textContent = level;
      if (level > best) {
        best = level;
        document.getElementById('best').textContent = best;
        chrome.storage.local.set({ dotConnectBest: best });
      }
      setTimeout(generateDots, 1000);
    }
    draw();
  }
});

document.getElementById('newGame').addEventListener('click', () => {
  level = 1;
  document.getElementById('level').textContent = level;
  document.getElementById('message').textContent = 'Connect numbered dots in order!';
  generateDots();
});

generateDots();
