const SIZE = 15;
let maze = [], player = { x: 1, y: 1 }, exit = { x: SIZE - 2, y: SIZE - 2 }, level = 0, moves = 0;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['mazeGenLevel']);
  level = data.mazeGenLevel || 0;
  document.getElementById('newMaze').addEventListener('click', generateMaze);
  document.querySelectorAll('.dir-btn').forEach(btn => {
    btn.addEventListener('click', () => move(btn.dataset.dir));
  });
  document.addEventListener('keydown', e => {
    const map = { w: 'up', a: 'left', s: 'down', d: 'right', ArrowUp: 'up', ArrowLeft: 'left', ArrowDown: 'down', ArrowRight: 'right' };
    if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
  });
  generateMaze();
}

function generateMaze() {
  moves = 0; updateUI();
  maze = Array(SIZE).fill(null).map(() => Array(SIZE).fill(1));
  carve(1, 1);
  player = { x: 1, y: 1 };
  exit = { x: SIZE - 2, y: SIZE - 2 };
  maze[exit.y][exit.x] = 0;
  render();
}

function carve(x, y) {
  maze[y][x] = 0;
  const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
  for (const [dx, dy] of dirs) {
    const nx = x + dx, ny = y + dy;
    if (nx > 0 && nx < SIZE - 1 && ny > 0 && ny < SIZE - 1 && maze[ny][nx] === 1) {
      maze[y + dy / 2][x + dx / 2] = 0;
      carve(nx, ny);
    }
  }
}

function render() {
  const container = document.getElementById('maze');
  container.style.gridTemplateColumns = `repeat(${SIZE}, 18px)`;
  container.innerHTML = '';
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell ' + (maze[y][x] === 1 ? 'wall' : 'path');
      if (x === player.x && y === player.y) cell.classList.add('player');
      else if (x === exit.x && y === exit.y) cell.classList.add('exit');
      container.appendChild(cell);
    }
  }
}

function move(dir) {
  const deltas = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const [dx, dy] = deltas[dir];
  const nx = player.x + dx, ny = player.y + dy;
  if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && maze[ny][nx] === 0) {
    player.x = nx; player.y = ny;
    moves++; updateUI();
    render();
    if (player.x === exit.x && player.y === exit.y) {
      level++; chrome.storage.local.set({ mazeGenLevel: level });
      setTimeout(() => { alert(`Maze ${level} solved in ${moves} moves!`); generateMaze(); }, 100);
    }
  }
}

function updateUI() {
  document.getElementById('level').textContent = level + 1;
  document.getElementById('moves').textContent = moves;
}
