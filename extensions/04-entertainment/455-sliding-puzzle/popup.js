const grid = document.getElementById('grid');
const movesEl = document.getElementById('moves');
const bestEl = document.getElementById('bestMoves');
const shuffleBtn = document.getElementById('shuffleBtn');

let tiles = [], moves = 0, bestMoves = null, emptyIdx = 15;

chrome.storage.local.get(['slidingBest'], (r) => {
  bestMoves = r.slidingBest || null;
  bestEl.textContent = bestMoves || '-';
});

function init() {
  tiles = [...Array(16).keys()];
  emptyIdx = 15;
  render();
}

function render() {
  grid.innerHTML = '';
  tiles.forEach((num, idx) => {
    const tile = document.createElement('div');
    tile.className = 'tile' + (num === 0 ? ' empty' : '') + (num === idx + 1 ? ' correct' : '');
    tile.textContent = num || '';
    tile.addEventListener('click', () => moveTile(idx));
    grid.appendChild(tile);
  });
}

function moveTile(idx) {
  const row = Math.floor(idx / 4), col = idx % 4;
  const emptyRow = Math.floor(emptyIdx / 4), emptyCol = emptyIdx % 4;
  const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;

  if (isAdjacent) {
    [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
    emptyIdx = idx;
    moves++;
    movesEl.textContent = moves;
    render();
    checkWin();
  }
}

function checkWin() {
  const solved = tiles.slice(0, 15).every((n, i) => n === i + 1);
  if (solved) {
    if (!bestMoves || moves < bestMoves) {
      bestMoves = moves;
      bestEl.textContent = bestMoves;
      chrome.storage.local.set({ slidingBest: bestMoves });
    }
    setTimeout(() => alert(`Solved in ${moves} moves!`), 100);
  }
}

function shuffle() {
  moves = 0;
  movesEl.textContent = 0;
  for (let i = 0; i < 200; i++) {
    const neighbors = getNeighbors(emptyIdx);
    const randNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[emptyIdx], tiles[randNeighbor]] = [tiles[randNeighbor], tiles[emptyIdx]];
    emptyIdx = randNeighbor;
  }
  render();
}

function getNeighbors(idx) {
  const row = Math.floor(idx / 4), col = idx % 4;
  const neighbors = [];
  if (row > 0) neighbors.push(idx - 4);
  if (row < 3) neighbors.push(idx + 4);
  if (col > 0) neighbors.push(idx - 1);
  if (col < 3) neighbors.push(idx + 1);
  return neighbors;
}

shuffleBtn.addEventListener('click', shuffle);
init();
shuffle();
