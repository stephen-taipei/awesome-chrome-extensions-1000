let grid = [], size = 3, level = 1, moves = 0;

function init() {
  chrome.storage.local.get(['lightUpLevel'], (r) => {
    level = r.lightUpLevel || 1;
    size = Math.min(3 + Math.floor((level - 1) / 3), 5);
    generateLevel();
  });
}

function generateLevel() {
  size = Math.min(3 + Math.floor((level - 1) / 3), 5);
  grid = Array(size * size).fill(false);
  moves = 0;
  document.getElementById('level').textContent = level;
  document.getElementById('moves').textContent = '0';
  const shuffles = 5 + level * 2;
  for (let i = 0; i < shuffles; i++) {
    toggleCell(Math.floor(Math.random() * size * size), false);
  }
  render();
}

function render() {
  const container = document.getElementById('grid');
  container.style.gridTemplateColumns = `repeat(${size}, 50px)`;
  container.innerHTML = '';
  grid.forEach((lit, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell' + (lit ? ' lit' : '');
    cell.addEventListener('click', () => toggleCell(i, true));
    container.appendChild(cell);
  });
}

function toggleCell(i, count) {
  const row = Math.floor(i / size), col = i % size;
  const indices = [i];
  if (row > 0) indices.push(i - size);
  if (row < size - 1) indices.push(i + size);
  if (col > 0) indices.push(i - 1);
  if (col < size - 1) indices.push(i + 1);
  indices.forEach(idx => grid[idx] = !grid[idx]);
  if (count) {
    moves++;
    document.getElementById('moves').textContent = moves;
    render();
    checkWin();
  }
}

function checkWin() {
  if (grid.every(c => c)) {
    setTimeout(() => {
      alert(`Level ${level} Complete in ${moves} moves!`);
      level++;
      chrome.storage.local.set({ lightUpLevel: level });
      generateLevel();
    }, 200);
  }
}

document.getElementById('restart').addEventListener('click', generateLevel);
init();
