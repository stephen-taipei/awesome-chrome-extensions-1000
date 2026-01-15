const gameArea = document.getElementById('gameArea');
const tower = document.getElementById('tower');
const movingShape = document.getElementById('movingShape');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const dropBtn = document.getElementById('dropBtn');

let score = 0, highScore = 0, shapes = [], shapeX = 0, dir = 1, speed = 3;
let lastWidth = 60, lastX = 130, running = false, moveLoop;

chrome.storage.local.get(['shapeStackHigh'], (r) => {
  highScore = r.shapeStackHigh || 0;
  highScoreEl.textContent = highScore;
});

function moveShape() {
  shapeX += dir * speed;
  if (shapeX <= 0 || shapeX >= 260) dir *= -1;
  movingShape.style.left = shapeX + 'px';
}

function dropShape() {
  if (!running) { startGame(); return; }
  const overlap = calculateOverlap();
  if (overlap <= 0) { endGame(); return; }

  const shape = document.createElement('div');
  shape.className = 'stacked';
  const newX = Math.max(shapeX, lastX);
  shape.style.left = newX + 'px';
  shape.style.width = overlap + 'px';
  shape.style.bottom = (score * 25) + 'px';
  if (overlap >= lastWidth - 5) shape.classList.add('perfect');
  tower.appendChild(shape);
  shapes.push(shape);

  lastX = newX;
  lastWidth = overlap;
  movingShape.style.width = overlap + 'px';
  score++;
  scoreEl.textContent = score;
  speed = Math.min(6, 3 + score * 0.2);

  if (score * 25 > 200) {
    shapes.forEach(s => {
      const bot = parseInt(s.style.bottom) - 25;
      s.style.bottom = bot + 'px';
      if (bot < 0) { s.remove(); }
    });
  }
}

function calculateOverlap() {
  const shapeEnd = shapeX + lastWidth;
  const lastEnd = lastX + lastWidth;
  const overlapStart = Math.max(shapeX, lastX);
  const overlapEnd = Math.min(shapeEnd, lastEnd);
  return overlapEnd - overlapStart;
}

function startGame() {
  running = true;
  score = 0;
  scoreEl.textContent = 0;
  shapes.forEach(s => s.remove());
  shapes = [];
  lastWidth = 60;
  lastX = 130;
  speed = 3;
  shapeX = 130;
  movingShape.style.width = '60px';
  movingShape.style.left = '130px';
  dropBtn.textContent = 'Drop!';
  moveLoop = setInterval(moveShape, 20);
}

function endGame() {
  running = false;
  clearInterval(moveLoop);
  dropBtn.textContent = 'Play Again';
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    chrome.storage.local.set({ shapeStackHigh: highScore });
  }
}

dropBtn.addEventListener('click', dropShape);
document.addEventListener('keydown', (e) => { if (e.code === 'Space') dropShape(); });
