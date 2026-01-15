const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const shapes = ['Circle', 'Square', 'Triangle', 'Line', 'X'];
let currentShape = '', score = 0, best = 0, drawing = false, points = [], timeLeft = 100;

chrome.storage.local.get(['quickDrawBest'], r => { best = r.quickDrawBest || 0; document.getElementById('best').textContent = best; });

function newRound() {
  ctx.fillStyle = '#0f0f23'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  currentShape = shapes[Math.floor(Math.random() * shapes.length)];
  document.getElementById('shape').textContent = currentShape;
  document.getElementById('message').textContent = '';
  points = []; timeLeft = 100;
  updateTimer();
}

function updateTimer() {
  timeLeft -= 2;
  document.getElementById('timer').style.width = timeLeft + '%';
  if (timeLeft <= 0) { document.getElementById('message').textContent = 'Time up! Try again'; setTimeout(newRound, 1000); }
  else setTimeout(updateTimer, 100);
}

function analyzeDrawing() {
  if (points.length < 10) return false;
  const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
  const w = maxX - minX, h = maxY - minY, ratio = w / (h || 1);
  const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
  const distances = points.map(p => Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2));
  const avgDist = distances.reduce((a, b) => a + b) / distances.length;
  const distVariance = distances.reduce((a, d) => a + (d - avgDist) ** 2, 0) / distances.length;
  if (currentShape === 'Circle') return distVariance < 400 && ratio > 0.7 && ratio < 1.3;
  if (currentShape === 'Square') return ratio > 0.7 && ratio < 1.3 && w > 50;
  if (currentShape === 'Triangle') return h > 50 && w > 50;
  if (currentShape === 'Line') return ratio > 3 || ratio < 0.33;
  if (currentShape === 'X') return w > 40 && h > 40;
  return false;
}

canvas.addEventListener('mousedown', e => { drawing = true; points = []; ctx.beginPath(); ctx.strokeStyle = '#e056fd'; ctx.lineWidth = 3; });
canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  points.push({ x, y });
  if (points.length === 1) ctx.moveTo(x, y);
  else { ctx.lineTo(x, y); ctx.stroke(); }
});
canvas.addEventListener('mouseup', () => {
  drawing = false;
  if (analyzeDrawing()) {
    score += Math.floor(timeLeft / 10) + 5;
    document.getElementById('score').textContent = score;
    document.getElementById('message').textContent = 'Nice! +' + (Math.floor(timeLeft / 10) + 5);
    if (score > best) { best = score; chrome.storage.local.set({ quickDrawBest: best }); document.getElementById('best').textContent = best; }
    timeLeft = 0;
    setTimeout(newRound, 800);
  }
});
canvas.addEventListener('mouseleave', () => { drawing = false; });

newRound();
