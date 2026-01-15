const gameArea = document.getElementById('gameArea');
const input = document.getElementById('input');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');

let score = 0, highScore = 0, digits = [], gameLoop, spawnLoop, running = false;

chrome.storage.local.get(['digitDropHigh'], (r) => {
  highScore = r.digitDropHigh || 0;
  highScoreEl.textContent = highScore;
});

function spawnDigit() {
  const num = Math.floor(Math.random() * 900) + 100;
  const digit = document.createElement('div');
  digit.className = 'digit';
  digit.textContent = num;
  digit.style.left = Math.random() * 260 + 'px';
  digit.style.top = '-40px';
  digit.dataset.value = num;
  digit.dataset.y = -40;
  gameArea.appendChild(digit);
  digits.push(digit);
}

function update() {
  digits.forEach((d, i) => {
    let y = parseFloat(d.dataset.y) + 1.5;
    d.dataset.y = y;
    d.style.top = y + 'px';
    if (y > 180) d.classList.add('warning');
    if (y > 250) endGame();
  });
}

function checkInput() {
  const val = input.value;
  digits.forEach((d, i) => {
    if (d.dataset.value === val) {
      score += 10;
      scoreEl.textContent = score;
      d.remove();
      digits.splice(i, 1);
      input.value = '';
    }
  });
}

function startGame() {
  if (running) return;
  running = true;
  score = 0;
  scoreEl.textContent = 0;
  digits.forEach(d => d.remove());
  digits = [];
  input.value = '';
  input.focus();
  startBtn.textContent = 'Playing...';
  gameLoop = setInterval(update, 30);
  spawnLoop = setInterval(spawnDigit, 1500);
  spawnDigit();
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  clearInterval(spawnLoop);
  startBtn.textContent = 'Play Again';
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    chrome.storage.local.set({ digitDropHigh: highScore });
  }
}

input.addEventListener('input', checkInput);
startBtn.addEventListener('click', startGame);
