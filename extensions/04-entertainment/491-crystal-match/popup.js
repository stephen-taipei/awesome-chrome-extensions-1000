const crystals = ['💎', '🔮', '💠', '🔵', '🟣', '🔷'];
const ROWS = 6, COLS = 6;
let grid = [], score = 0, best = 0, selected = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['crystalBest']);
  best = data.crystalBest || 0;
  document.getElementById('best').textContent = best;
  document.getElementById('newGame').addEventListener('click', newGame);
  newGame();
}

function newGame() {
  score = 0;
  selected = null;
  updateScore();
  generateGrid();
  render();
}

function generateGrid() {
  grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = crystals[Math.floor(Math.random() * crystals.length)];
    }
  }
  while (findMatches().length > 0) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = crystals[Math.floor(Math.random() * crystals.length)];
      }
    }
  }
}

function render() {
  const container = document.getElementById('grid');
  container.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (selected && selected.r === r && selected.c === c) cell.classList.add('selected');
      cell.addEventListener('click', () => handleClick(r, c));
      container.appendChild(cell);
    }
  }
}

function handleClick(r, c) {
  if (!selected) { selected = { r, c }; render(); return; }
  if (selected.r === r && selected.c === c) { selected = null; render(); return; }
  if (isAdjacent(selected, { r, c })) {
    swap(selected, { r, c });
    const matches = findMatches();
    if (matches.length > 0) { processMatches(matches); }
    else { swap(selected, { r, c }); }
    selected = null;
  } else { selected = { r, c }; }
  render();
}

function isAdjacent(a, b) {
  return (Math.abs(a.r - b.r) === 1 && a.c === b.c) || (Math.abs(a.c - b.c) === 1 && a.r === b.r);
}

function swap(a, b) {
  const temp = grid[a.r][a.c];
  grid[a.r][a.c] = grid[b.r][b.c];
  grid[b.r][b.c] = temp;
}

function findMatches() {
  const matches = new Set();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      if (grid[r][c] && grid[r][c] === grid[r][c+1] && grid[r][c] === grid[r][c+2]) {
        matches.add(`${r},${c}`); matches.add(`${r},${c+1}`); matches.add(`${r},${c+2}`);
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 2; r++) {
      if (grid[r][c] && grid[r][c] === grid[r+1][c] && grid[r][c] === grid[r+2][c]) {
        matches.add(`${r},${c}`); matches.add(`${r+1},${c}`); matches.add(`${r+2},${c}`);
      }
    }
  }
  return Array.from(matches).map(s => { const [r, c] = s.split(','); return { r: +r, c: +c }; });
}

function processMatches(matches) {
  score += matches.length * 10;
  updateScore();
  matches.forEach(m => grid[m.r][m.c] = null);
  setTimeout(() => { dropCrystals(); fillEmpty(); render();
    const newMatches = findMatches();
    if (newMatches.length > 0) setTimeout(() => processMatches(newMatches), 200);
  }, 300);
}

function dropCrystals() {
  for (let c = 0; c < COLS; c++) {
    let empty = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][c]) { grid[empty][c] = grid[r][c]; if (empty !== r) grid[r][c] = null; empty--; }
    }
  }
}

function fillEmpty() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c]) grid[r][c] = crystals[Math.floor(Math.random() * crystals.length)];
    }
  }
}

function updateScore() {
  document.getElementById('score').textContent = score;
  if (score > best) { best = score; document.getElementById('best').textContent = best; chrome.storage.local.set({ crystalBest: best }); }
}
