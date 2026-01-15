const gridEl = document.getElementById('grid');
const colorsEl = document.getElementById('colors');
const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#dda0dd', '#87ceeb'];
let grid = [], size = 10, moves = 0, maxMoves = 25, wins = 0;

chrome.storage.local.get(['colorFloodWins'], (r) => {
  wins = r.colorFloodWins || 0;
  document.getElementById('wins').textContent = wins;
});

function generateGame() {
  grid = []; moves = 0;
  document.getElementById('moves').textContent = moves;
  document.getElementById('message').textContent = 'Fill the board with one color!';
  gridEl.style.gridTemplateColumns = `repeat(${size}, 28px)`;
  gridEl.innerHTML = '';
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      grid[r][c] = colors[Math.floor(Math.random() * colors.length)];
      cell.style.background = grid[r][c];
      gridEl.appendChild(cell);
    }
  }
  colorsEl.innerHTML = '';
  colors.forEach(color => {
    const btn = document.createElement('div');
    btn.className = 'color-btn';
    btn.style.background = color;
    btn.addEventListener('click', () => flood(color));
    colorsEl.appendChild(btn);
  });
}

function flood(newColor) {
  const oldColor = grid[0][0];
  if (oldColor === newColor) return;
  moves++;
  document.getElementById('moves').textContent = moves;
  const stack = [[0, 0]];
  const visited = new Set();
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (visited.has(key) || r < 0 || r >= size || c < 0 || c >= size) continue;
    if (grid[r][c] !== oldColor) continue;
    visited.add(key);
    grid[r][c] = newColor;
    stack.push([r-1, c], [r+1, c], [r, c-1], [r, c+1]);
  }
  updateDisplay();
  checkWin();
}

function updateDisplay() {
  const cells = gridEl.children;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      cells[r * size + c].style.background = grid[r][c];
    }
  }
}

function checkWin() {
  const first = grid[0][0];
  const won = grid.every(row => row.every(c => c === first));
  if (won) {
    wins++;
    document.getElementById('wins').textContent = wins;
    chrome.storage.local.set({ colorFloodWins: wins });
    document.getElementById('message').textContent = `You won in ${moves} moves!`;
  } else if (moves >= maxMoves) {
    document.getElementById('message').textContent = 'Out of moves! Try again.';
  }
}

document.getElementById('newGame').addEventListener('click', generateGame);
generateGame();
