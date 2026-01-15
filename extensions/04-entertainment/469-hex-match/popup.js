const colors = ['#fd79a8', '#a29bfe', '#74b9ff', '#55efc4', '#ffeaa7', '#fab1a0'];
const symbols = ['*', '+', 'o', '#', '~', '^'];
let grid = [], selected = null, score = 0, best = 0;

chrome.storage.local.get(['hexMatchBest'], r => { best = r.hexMatchBest || 0; document.getElementById('best').textContent = best; });

function initGrid() {
  grid = [];
  for (let row = 0; row < 7; row++) {
    const cols = row % 2 === 0 ? 5 : 4;
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      grid[row][col] = Math.floor(Math.random() * 6);
    }
  }
  renderGrid();
}

function renderGrid() {
  const gridDiv = document.getElementById('grid');
  gridDiv.innerHTML = '';
  grid.forEach((row, ri) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row' + (ri % 2 === 1 ? ' offset' : '');
    row.forEach((val, ci) => {
      const hex = document.createElement('div');
      hex.className = 'hex';
      hex.style.background = colors[val];
      hex.textContent = symbols[val];
      hex.dataset.row = ri; hex.dataset.col = ci;
      hex.addEventListener('click', () => selectHex(ri, ci));
      rowDiv.appendChild(hex);
    });
    gridDiv.appendChild(rowDiv);
  });
}

function selectHex(row, col) {
  if (!selected) { selected = { row, col }; document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.add('selected'); }
  else {
    if (isAdjacent(selected.row, selected.col, row, col)) {
      [grid[selected.row][selected.col], grid[row][col]] = [grid[row][col], grid[selected.row][selected.col]];
      const matches = findMatches();
      if (matches.length > 0) { removeMatches(matches); score += matches.length * 10; document.getElementById('score').textContent = score;
        if (score > best) { best = score; chrome.storage.local.set({ hexMatchBest: best }); document.getElementById('best').textContent = best; }
        document.getElementById('message').textContent = `+${matches.length * 10}!`;
      } else { [grid[selected.row][selected.col], grid[row][col]] = [grid[row][col], grid[selected.row][selected.col]]; document.getElementById('message').textContent = 'No match'; }
    }
    document.querySelectorAll('.hex').forEach(h => h.classList.remove('selected'));
    selected = null;
    renderGrid();
  }
}

function isAdjacent(r1, c1, r2, c2) {
  const dr = Math.abs(r1 - r2), dc = Math.abs(c1 - c2);
  if (dr === 0 && dc === 1) return true;
  if (dr === 1 && dc <= 1) return true;
  return false;
}

function findMatches() {
  const matches = new Set();
  grid.forEach((row, ri) => {
    for (let ci = 0; ci < row.length - 2; ci++) {
      if (row[ci] === row[ci+1] && row[ci+1] === row[ci+2]) { matches.add(`${ri},${ci}`); matches.add(`${ri},${ci+1}`); matches.add(`${ri},${ci+2}`); }
    }
  });
  return Array.from(matches);
}

function removeMatches(matches) {
  matches.forEach(m => { const [r, c] = m.split(',').map(Number); grid[r][c] = Math.floor(Math.random() * 6); });
}

initGrid();
