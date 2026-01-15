const gameArea = document.getElementById('gameArea');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const highScoreEl = document.getElementById('highScore');
const feedbackEl = document.getElementById('feedback');
const startBtn = document.getElementById('startBtn');

const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
let score = 0, highScore = 0, combo = 0, beats = [], running = false, spawnLoop, checkLoop;

chrome.storage.local.get(['rhythmTapHigh'], (r) => {
  highScore = r.rhythmTapHigh || 0;
  highScoreEl.textContent = highScore;
});

function spawnBeat() {
  const beat = document.createElement('div');
  beat.className = 'beat';
  const color = colors[Math.floor(Math.random() * colors.length)];
  beat.style.borderColor = color;
  beat.style.color = color;
  beat.style.background = `${color}22`;
  beat.style.left = Math.random() * 250 + 'px';
  beat.style.top = Math.random() * 180 + 'px';
  beat.dataset.time = Date.now();
  beat.textContent = '!';
  beat.addEventListener('click', () => tapBeat(beat));
  gameArea.appendChild(beat);
  beats.push(beat);
}

function tapBeat(beat) {
  if (!running) return;
  const age = Date.now() - parseInt(beat.dataset.time);
  let points = 0, msg = '';

  if (age < 400) { points = 100; msg = 'PERFECT!'; feedbackEl.className = 'feedback perfect'; }
  else if (age < 800) { points = 50; msg = 'Good!'; feedbackEl.className = 'feedback good'; }
  else { points = 25; msg = 'OK'; feedbackEl.className = 'feedback'; }

  combo++;
  points *= (1 + combo * 0.1);
  score += Math.floor(points);
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  feedbackEl.textContent = msg;

  beat.classList.add('hit');
  setTimeout(() => {
    beat.remove();
    beats = beats.filter(b => b !== beat);
  }, 200);
}

function checkMissed() {
  const now = Date.now();
  beats.forEach((b, i) => {
    if (now - parseInt(b.dataset.time) > 1500) {
      combo = 0;
      comboEl.textContent = 0;
      feedbackEl.textContent = 'Miss!';
      feedbackEl.className = 'feedback miss';
      b.remove();
      beats.splice(i, 1);
    }
  });
}

function startGame() {
  if (running) return;
  running = true;
  score = 0; combo = 0;
  scoreEl.textContent = 0;
  comboEl.textContent = 0;
  feedbackEl.textContent = '';
  beats.forEach(b => b.remove());
  beats = [];
  startBtn.textContent = 'Playing...';
  spawnLoop = setInterval(spawnBeat, 600);
  checkLoop = setInterval(checkMissed, 100);
  setTimeout(endGame, 30000);
}

function endGame() {
  running = false;
  clearInterval(spawnLoop);
  clearInterval(checkLoop);
  beats.forEach(b => b.remove());
  beats = [];
  startBtn.textContent = 'Play Again';
  feedbackEl.textContent = 'Game Over!';
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    chrome.storage.local.set({ rhythmTapHigh: highScore });
  }
}

startBtn.addEventListener('click', startGame);
