const gridEl = document.getElementById('grid');
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let grid = [], targetLetter = '', targetCount = 0, found = 0, score = 0, best = 0, size = 6;

chrome.storage.local.get(['letterHuntBest'], (r) => {
  best = r.letterHuntBest || 0;
  document.getElementById('best').textContent = best;
});

function generateGame() {
  grid = []; found = 0;
  targetLetter = letters[Math.floor(Math.random() * 26)];
  document.getElementById('targetLetter').textContent = targetLetter;
  document.getElementById('message').textContent = 'Find all target letters!';
  gridEl.style.gridTemplateColumns = `repeat(${size}, 40px)`;
  gridEl.innerHTML = '';
  targetCount = 3 + Math.floor(Math.random() * 3);
  const positions = new Set();
  while (positions.size < targetCount) {
    positions.add(Math.floor(Math.random() * size * size));
  }
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const isTarget = positions.has(i);
    const letter = isTarget ? targetLetter : letters[Math.floor(Math.random() * 26)];
    if (!isTarget && letter === targetLetter) {
      cell.textContent = letters[(letters.indexOf(letter) + 1) % 26];
    } else {
      cell.textContent = letter;
    }
    cell.dataset.target = isTarget;
    cell.addEventListener('click', () => handleClick(cell));
    gridEl.appendChild(cell);
  }
}

function handleClick(cell) {
  if (cell.classList.contains('found') || cell.classList.contains('wrong')) return;
  if (cell.dataset.target === 'true') {
    cell.classList.add('found');
    found++;
    score += 10;
    document.getElementById('score').textContent = score;
    if (found === targetCount) {
      document.getElementById('message').textContent = 'All found! Starting new round...';
      if (score > best) {
        best = score;
        document.getElementById('best').textContent = best;
        chrome.storage.local.set({ letterHuntBest: best });
      }
      setTimeout(generateGame, 1000);
    }
  } else {
    cell.classList.add('wrong');
    score = Math.max(0, score - 5);
    document.getElementById('score').textContent = score;
    setTimeout(() => cell.classList.remove('wrong'), 300);
  }
}

document.getElementById('newGame').addEventListener('click', () => {
  score = 0;
  document.getElementById('score').textContent = score;
  generateGame();
});

generateGame();
