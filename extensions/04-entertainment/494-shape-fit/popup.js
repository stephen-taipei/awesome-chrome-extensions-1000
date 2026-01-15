const SHAPES = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠', '⬛', '💠', '⭐', '💎'];
let score = 0, best = 0, timeLeft = 30, timer = null, currentHoles = [], selected = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['shapeFitBest']);
  best = data.shapeFitBest || 0;
  document.getElementById('best').textContent = best;
  document.getElementById('startBtn').addEventListener('click', startGame);
}

function startGame() {
  score = 0; timeLeft = 30; selected = null;
  updateScore();
  updateTime();
  generateRound();
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function generateRound() {
  const holeCount = Math.min(4, 2 + Math.floor(score / 50));
  const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
  currentHoles = shuffled.slice(0, holeCount);
  const extraShapes = shuffled.slice(holeCount, holeCount + 3);
  const allShapes = [...currentHoles, ...extraShapes].sort(() => Math.random() - 0.5);
  renderHoles();
  renderShapes(allShapes);
}

function renderHoles() {
  const container = document.getElementById('holes');
  container.innerHTML = '';
  currentHoles.forEach((shape, i) => {
    const hole = document.createElement('div');
    hole.className = 'hole active';
    hole.textContent = shape;
    hole.dataset.index = i;
    hole.addEventListener('click', () => placeShape(i));
    container.appendChild(hole);
  });
}

function renderShapes(shapes) {
  const container = document.getElementById('shapes');
  container.innerHTML = '';
  shapes.forEach(shape => {
    const el = document.createElement('div');
    el.className = 'shape';
    el.textContent = shape;
    el.addEventListener('click', () => selectShape(el, shape));
    container.appendChild(el);
  });
}

function selectShape(el, shape) {
  document.querySelectorAll('.shape').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selected = { el, shape };
}

function placeShape(holeIndex) {
  if (!selected) return;
  const hole = document.querySelectorAll('.hole')[holeIndex];
  if (hole.classList.contains('filled')) return;
  if (selected.shape === currentHoles[holeIndex]) {
    hole.classList.add('filled');
    hole.classList.remove('active');
    selected.el.remove();
    score += 10;
    updateScore();
    selected = null;
    const allFilled = document.querySelectorAll('.hole.filled').length === currentHoles.length;
    if (allFilled) {
      score += 20;
      updateScore();
      setTimeout(generateRound, 300);
    }
  } else {
    score = Math.max(0, score - 5);
    updateScore();
  }
}

function endGame() {
  clearInterval(timer);
  timer = null;
  document.getElementById('holes').innerHTML = '<div style="padding:20px;text-align:center">Game Over!</div>';
  document.getElementById('shapes').innerHTML = '';
  if (score > best) {
    best = score;
    document.getElementById('best').textContent = best;
    chrome.storage.local.set({ shapeFitBest: best });
  }
}

function updateScore() { document.getElementById('score').textContent = score; }
function updateTime() { document.getElementById('time').textContent = timeLeft; }
