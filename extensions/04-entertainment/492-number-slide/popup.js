const SIZE = 4;
let tiles = [], emptyPos = SIZE * SIZE - 1, moves = 0, best = null, won = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['slideBest']);
  best = data.slideBest || null;
  document.getElementById('best').textContent = best || '-';
  document.getElementById('newGame').addEventListener('click', newGame);
  newGame();
}

function newGame() {
  moves = 0; won = false;
  updateMoves();
  tiles = Array.from({ length: SIZE * SIZE - 1 }, (_, i) => i + 1);
  tiles.push(0);
  emptyPos = SIZE * SIZE - 1;
  shuffle();
  render();
}

function shuffle() {
  for (let i = 0; i < 200; i++) {
    const neighbors = getNeighbors(emptyPos);
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    swap(emptyPos, randomNeighbor);
    emptyPos = randomNeighbor;
  }
}

function getNeighbors(pos) {
  const neighbors = [];
  const row = Math.floor(pos / SIZE), col = pos % SIZE;
  if (row > 0) neighbors.push(pos - SIZE);
  if (row < SIZE - 1) neighbors.push(pos + SIZE);
  if (col > 0) neighbors.push(pos - 1);
  if (col < SIZE - 1) neighbors.push(pos + 1);
  return neighbors;
}

function swap(a, b) {
  [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
}

function render() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  tiles.forEach((num, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile' + (num === 0 ? ' empty' : '');
    tile.textContent = num === 0 ? '' : num;
    if (num !== 0 && num === i + 1) tile.classList.add('correct');
    if (won) tile.classList.add('win');
    tile.addEventListener('click', () => handleClick(i));
    grid.appendChild(tile);
  });
}

function handleClick(pos) {
  if (won || tiles[pos] === 0) return;
  const neighbors = getNeighbors(pos);
  if (neighbors.includes(emptyPos)) {
    swap(pos, emptyPos);
    emptyPos = pos;
    moves++;
    updateMoves();
    render();
    checkWin();
  }
}

function checkWin() {
  for (let i = 0; i < SIZE * SIZE - 1; i++) {
    if (tiles[i] !== i + 1) return;
  }
  won = true;
  if (best === null || moves < best) {
    best = moves;
    document.getElementById('best').textContent = best;
    chrome.storage.local.set({ slideBest: best });
  }
  render();
}

function updateMoves() {
  document.getElementById('moves').textContent = moves;
}
