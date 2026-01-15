const gameArea = document.getElementById('gameArea');
const input = document.getElementById('input');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');

const wordList = ['code','rain','drop','fast','type','game','play','word','fall','quick','speed','skill','point','score','level','bonus','chrome','pixel','cyber','neon'];
let score = 0, highScore = 0, words = [], gameLoop, spawnLoop, running = false;

chrome.storage.local.get(['wordRainHigh'], (r) => {
  highScore = r.wordRainHigh || 0;
  highScoreEl.textContent = highScore;
});

function spawnWord() {
  const text = wordList[Math.floor(Math.random() * wordList.length)];
  const word = document.createElement('div');
  word.className = 'word';
  word.textContent = text;
  word.style.left = Math.random() * 220 + 'px';
  word.style.top = '-30px';
  word.dataset.value = text;
  word.dataset.y = -30;
  gameArea.appendChild(word);
  words.push(word);
}

function update() {
  words.forEach((w, i) => {
    let y = parseFloat(w.dataset.y) + 1;
    w.dataset.y = y;
    w.style.top = y + 'px';
    if (y > 190) w.classList.add('danger');
    if (y > 250) endGame();
  });
}

function checkInput() {
  const val = input.value.toLowerCase().trim();
  words.forEach((w, i) => {
    if (w.dataset.value === val) {
      score += val.length * 2;
      scoreEl.textContent = score;
      w.remove();
      words.splice(i, 1);
      input.value = '';
    }
  });
}

function startGame() {
  if (running) return;
  running = true;
  score = 0;
  scoreEl.textContent = 0;
  words.forEach(w => w.remove());
  words = [];
  input.value = '';
  input.focus();
  startBtn.textContent = 'Playing...';
  gameLoop = setInterval(update, 30);
  spawnLoop = setInterval(spawnWord, 2000);
  spawnWord();
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  clearInterval(spawnLoop);
  startBtn.textContent = 'Play Again';
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    chrome.storage.local.set({ wordRainHigh: highScore });
  }
}

input.addEventListener('input', checkInput);
startBtn.addEventListener('click', startGame);
