document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const levelEl = document.getElementById('level');
  const movesEl = document.getElementById('moves');
  const newGameBtn = document.getElementById('new-game');

  const pipes = {
    straight: { svg: '<line x1="20" y1="0" x2="20" y2="40" stroke="#4ecdc4" stroke-width="8"/>', conn: [0, 2] },
    corner: { svg: '<path d="M20 0 L20 20 L40 20" fill="none" stroke="#4ecdc4" stroke-width="8"/>', conn: [0, 1] },
    tee: { svg: '<path d="M0 20 L40 20 M20 20 L20 40" fill="none" stroke="#4ecdc4" stroke-width="8"/>', conn: [1, 2, 3] },
    cross: { svg: '<path d="M20 0 L20 40 M0 20 L40 20" fill="none" stroke="#4ecdc4" stroke-width="8"/>', conn: [0, 1, 2, 3] }
  };
  const pipeTypes = ['straight', 'corner', 'tee', 'cross'];
  const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  let level = 1, moves = 0, cells = [], size = 5;

  const loadLevel = () => chrome.storage.local.get(['connectPipeLevel'], r => { level = r.connectPipeLevel || 1; levelEl.textContent = level; generatePuzzle(); });
  const saveLevel = () => chrome.storage.local.set({ connectPipeLevel: level });

  const rotatePipe = (cell) => { cell.rotation = (cell.rotation + 90) % 360; cell.currentConn = cell.baseConn.map(c => (c + cell.rotation / 90) % 4); };

  const generatePuzzle = () => {
    cells = []; moves = 0; movesEl.textContent = 0;
    grid.innerHTML = ''; grid.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const type = pipeTypes[Math.floor(Math.random() * pipeTypes.length)];
        const rotation = Math.floor(Math.random() * 4) * 90;
        const cell = { x, y, type, rotation, baseConn: [...pipes[type].conn], currentConn: pipes[type].conn.map(c => (c + rotation / 90) % 4) };
        cells.push(cell);
      }
    }
    cells[0].isStart = true; cells[cells.length - 1].isEnd = true;
    render();
  };

  const render = () => {
    grid.innerHTML = '';
    cells.forEach((cell, i) => {
      const div = document.createElement('div');
      div.className = 'cell' + (cell.isStart ? ' start' : '') + (cell.isEnd ? ' end' : '');
      div.innerHTML = `<svg viewBox="0 0 40 40" style="transform: rotate(${cell.rotation}deg)">${pipes[cell.type].svg}</svg>`;
      div.addEventListener('click', () => { rotatePipe(cell); moves++; movesEl.textContent = moves; render(); checkWin(); });
      grid.appendChild(div);
    });
  };

  const getCell = (x, y) => cells.find(c => c.x === x && c.y === y);

  const checkConnection = (from, to, dir) => {
    if (!from || !to) return false;
    const opposite = (dir + 2) % 4;
    return from.currentConn.includes(dir) && to.currentConn.includes(opposite);
  };

  const checkWin = () => {
    const visited = new Set();
    const queue = [cells[0]];
    visited.add('0,0');
    while (queue.length) {
      const current = queue.shift();
      if (current.isEnd) { level++; levelEl.textContent = level; saveLevel(); setTimeout(() => { alert(`Level ${level - 1} Complete!`); generatePuzzle(); }, 100); return; }
      current.currentConn.forEach(dir => {
        const nx = current.x + dirs[dir][0], ny = current.y + dirs[dir][1];
        const key = `${nx},${ny}`;
        if (!visited.has(key)) {
          const neighbor = getCell(nx, ny);
          if (neighbor && checkConnection(current, neighbor, dir)) { visited.add(key); queue.push(neighbor); }
        }
      });
    }
  };

  newGameBtn.addEventListener('click', generatePuzzle);
  loadLevel();
});
