const CELL = 44, LEVELS = [
  { key: { x: 0, y: 2, w: 2, h: 1 }, blocks: [{ x: 2, y: 0, w: 1, h: 3 }, { x: 3, y: 1, w: 2, h: 1 }, { x: 4, y: 2, w: 1, h: 2 }] },
  { key: { x: 1, y: 2, w: 2, h: 1 }, blocks: [{ x: 0, y: 0, w: 1, h: 2 }, { x: 3, y: 0, w: 1, h: 3 }, { x: 4, y: 1, w: 2, h: 1 }, { x: 4, y: 2, w: 1, h: 3 }] },
  { key: { x: 0, y: 2, w: 2, h: 1 }, blocks: [{ x: 2, y: 1, w: 1, h: 3 }, { x: 3, y: 0, w: 2, h: 1 }, { x: 4, y: 1, w: 1, h: 2 }, { x: 3, y: 3, w: 1, h: 2 }, { x: 5, y: 2, w: 1, h: 3 }] }
];
let level = 0, moves = 0, blocks = [], dragging = null, startPos = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['gridLockLevel']);
  level = data.gridLockLevel || 0;
  document.getElementById('resetBtn').addEventListener('click', resetLevel);
  loadLevel();
}

function loadLevel() {
  moves = 0; updateUI();
  const lvl = LEVELS[level % LEVELS.length];
  blocks = [{ ...lvl.key, isKey: true }, ...lvl.blocks.map(b => ({ ...b }))];
  render();
}

function render() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let i = 0; i < 36; i++) { const c = document.createElement('div'); c.className = 'cell'; grid.appendChild(c); }
  blocks.forEach((b, i) => {
    const el = document.createElement('div');
    const isH = b.w > b.h;
    el.className = 'block ' + (b.isKey ? 'key' : isH ? 'h' : 'v');
    el.style.left = (b.x * CELL + 5) + 'px';
    el.style.top = (b.y * CELL + 5) + 'px';
    el.style.width = (b.w * CELL - 4) + 'px';
    el.style.height = (b.h * CELL - 4) + 'px';
    el.textContent = b.isKey ? '🔑' : '';
    el.addEventListener('mousedown', e => startDrag(e, i));
    grid.appendChild(el);
  });
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
}

function startDrag(e, idx) { dragging = idx; startPos = { x: e.clientX, y: e.clientY, bx: blocks[idx].x, by: blocks[idx].y }; }

function onDrag(e) {
  if (dragging === null) return;
  const b = blocks[dragging], isH = b.w > b.h;
  const dx = Math.round((e.clientX - startPos.x) / CELL), dy = Math.round((e.clientY - startPos.y) / CELL);
  let newX = startPos.bx, newY = startPos.by;
  if (isH || b.w === b.h) newX = Math.max(0, Math.min(6 - b.w, startPos.bx + dx));
  if (!isH || b.w === b.h) newY = Math.max(0, Math.min(6 - b.h, startPos.by + dy));
  if (canMove(dragging, newX, newY)) { b.x = newX; b.y = newY; render(); }
}

function endDrag() {
  if (dragging !== null && (blocks[dragging].x !== startPos.bx || blocks[dragging].y !== startPos.by)) {
    moves++; updateUI(); checkWin();
  }
  dragging = null; startPos = null;
}

function canMove(idx, nx, ny) {
  const b = blocks[idx];
  for (let i = 0; i < blocks.length; i++) {
    if (i === idx) continue;
    const o = blocks[i];
    if (nx < o.x + o.w && nx + b.w > o.x && ny < o.y + o.h && ny + b.h > o.y) return false;
  }
  return true;
}

function checkWin() {
  const key = blocks[0];
  if (key.x + key.w >= 6 && key.y === 2) {
    level++; chrome.storage.local.set({ gridLockLevel: level });
    setTimeout(() => { alert('Level Complete!'); loadLevel(); }, 100);
  }
}

function resetLevel() { loadLevel(); }
function updateUI() { document.getElementById('level').textContent = level + 1; document.getElementById('moves').textContent = moves; }
