const WORDS = ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'FISH', 'BIRD', 'TREE', 'FIRE', 'RAIN', 'BLUE', 'GOLD'];
let score = 0, best = 0, targetWord = '', collected = '', gameLoop = null, letters = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['letterDropBest']);
  best = data.letterDropBest || 0;
  document.getElementById('best').textContent = best;
  document.getElementById('startBtn').addEventListener('click', startGame);
}

function startGame() {
  score = 0; collected = '';
  updateScore();
  updateCollected();
  targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  document.getElementById('targetWord').textContent = targetWord;
  document.getElementById('gameArea').innerHTML = '';
  letters = [];
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(spawnLetter, 800);
}

function spawnLetter() {
  const gameArea = document.getElementById('gameArea');
  const letter = document.createElement('div');
  const isTarget = Math.random() < 0.4;
  const char = isTarget ? targetWord[Math.floor(Math.random() * targetWord.length)] :
    String.fromCharCode(65 + Math.floor(Math.random() * 26));
  letter.className = 'letter ' + (targetWord.includes(char) ? 'correct' : 'neutral');
  letter.textContent = char;
  letter.style.left = Math.random() * 240 + 'px';
  letter.style.animation = `fall ${2 + Math.random()}s linear forwards`;
  letter.addEventListener('click', () => catchLetter(letter, char));
  letter.addEventListener('animationend', () => { letter.remove(); checkMissed(char); });
  gameArea.appendChild(letter);
  letters.push({ el: letter, char });
}

function catchLetter(el, char) {
  el.remove();
  const nextNeeded = targetWord[collected.length];
  if (char === nextNeeded) {
    collected += char;
    score += 10;
    updateCollected();
    updateScore();
    if (collected === targetWord) {
      score += 50;
      updateScore();
      setTimeout(() => {
        collected = '';
        targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        document.getElementById('targetWord').textContent = targetWord;
        updateCollected();
      }, 500);
    }
  } else if (!targetWord.includes(char)) {
    score = Math.max(0, score - 5);
    updateScore();
  }
}

function checkMissed(char) {
  const nextNeeded = targetWord[collected.length];
  if (char === nextNeeded) {
    score = Math.max(0, score - 10);
    updateScore();
  }
}

function updateScore() {
  document.getElementById('score').textContent = score;
  if (score > best) {
    best = score;
    document.getElementById('best').textContent = best;
    chrome.storage.local.set({ letterDropBest: best });
  }
}

function updateCollected() {
  document.getElementById('collected').textContent = collected || '---';
}
