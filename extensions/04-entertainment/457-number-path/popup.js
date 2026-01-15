const grid = document.getElementById('grid');
let cells = [], numbers = [], path = [], currentNum = 1, level = 1, best = 0, size = 5;

chrome.storage.local.get(['numberPathBest'], (r) => {
  best = r.numberPathBest || 0;
  document.getElementById('best').textContent = best;
});

function generateGame() {
  cells = []; numbers = []; path = []; currentNum = 1;
  const maxNum = 3 + level;
  const positions = [];
  while (positions.length < maxNum) {
    const pos = { r: Math.floor(Math.random() * size), c: Math.floor(Math.random() * size) };
    if (!positions.find(p => p.r === pos.r && p.c === pos.c)) positions.push(pos);
  }
  numbers = positions.map((p, i) => ({ ...p, num: i + 1 }));
  grid.style.gridTemplateColumns = `repeat(${size}, 45px)`;
  grid.innerHTML = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      const num = numbers.find(n => n.r === r && n.c === c);
      if (num) { cell.classList.add('number'); cell.textContent = num.num; }
      cell.addEventListener('click', () => handleClick(r, c));
      grid.appendChild(cell);
      cells.push(cell);
    }
  }
  highlightCurrent();
}

function getCell(r, c) { return cells[r * size + c]; }

function highlightCurrent() {
  cells.forEach(c => c.classList.remove('current'));
  const num = numbers.find(n => n.num === currentNum);
  if (num) getCell(num.r, num.c).classList.add('current');
}

function handleClick(r, c) {
  const target = numbers.find(n => n.num === currentNum);
  if (r !== target.r || c !== target.c) return;
  const cell = getCell(r, c);
  cell.classList.add('path');
  path.push({ r, c });
  currentNum++;
  if (currentNum > numbers.length) {
    document.getElementById('message').textContent = 'Level Complete!';
    level++;
    document.getElementById('level').textContent = level;
    if (level > best) {
      best = level;
      document.getElementById('best').textContent = best;
      chrome.storage.local.set({ numberPathBest: best });
    }
    setTimeout(generateGame, 1000);
  } else {
    highlightCurrent();
  }
}

document.getElementById('newGame').addEventListener('click', () => {
  level = 1;
  document.getElementById('level').textContent = level;
  document.getElementById('message').textContent = 'Draw path from 1 to max number!';
  generateGame();
});

generateGame();
