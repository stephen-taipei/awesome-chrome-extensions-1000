const RING_SIZES = [1, 2, 3, 4, 5];
let level = 0, moves = 0, pegs = [[], [], []], targetPeg = 2, targetOrder = [], selected = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['ringStackLevel']);
  level = data.ringStackLevel || 0;
  document.getElementById('resetBtn').addEventListener('click', resetLevel);
  loadLevel();
}

function loadLevel() {
  moves = 0; selected = null;
  const ringCount = Math.min(5, 3 + Math.floor(level / 2));
  targetOrder = RING_SIZES.slice(0, ringCount).reverse();
  pegs = [[], [], []];
  const shuffled = [...targetOrder].sort(() => Math.random() - 0.5);
  shuffled.forEach((ring, i) => pegs[i % 3].push(ring));
  updateUI();
  renderTarget();
  render();
}

function renderTarget() {
  const container = document.getElementById('target');
  container.innerHTML = '';
  targetOrder.forEach(size => {
    const ring = document.createElement('div');
    ring.className = `ring r${size}`;
    container.appendChild(ring);
  });
}

function render() {
  const container = document.getElementById('pegs');
  container.innerHTML = '';
  pegs.forEach((peg, pegIdx) => {
    const pegEl = document.createElement('div');
    pegEl.className = 'peg';
    const rod = document.createElement('div');
    rod.className = 'peg-rod' + (selected === pegIdx ? ' selected' : '');
    rod.addEventListener('click', () => handleClick(pegIdx));
    const ringContainer = document.createElement('div');
    ringContainer.className = 'ring-container';
    peg.forEach(size => {
      const ring = document.createElement('div');
      ring.className = `ring r${size}`;
      ringContainer.appendChild(ring);
    });
    rod.appendChild(ringContainer);
    const base = document.createElement('div');
    base.className = 'peg-base';
    pegEl.appendChild(rod);
    pegEl.appendChild(base);
    container.appendChild(pegEl);
  });
}

function handleClick(pegIdx) {
  if (selected === null) {
    if (pegs[pegIdx].length > 0) { selected = pegIdx; render(); }
  } else if (selected === pegIdx) {
    selected = null; render();
  } else {
    const ring = pegs[selected][pegs[selected].length - 1];
    const topRing = pegs[pegIdx].length > 0 ? pegs[pegIdx][pegs[pegIdx].length - 1] : Infinity;
    if (ring < topRing) {
      pegs[pegIdx].push(pegs[selected].pop());
      moves++;
      updateUI();
      checkWin();
    }
    selected = null;
    render();
  }
}

function checkWin() {
  if (pegs[targetPeg].length === targetOrder.length) {
    const isCorrect = pegs[targetPeg].every((r, i) => r === targetOrder[i]);
    if (isCorrect) {
      level++;
      chrome.storage.local.set({ ringStackLevel: level });
      setTimeout(() => { alert(`Level ${level} complete in ${moves} moves!`); loadLevel(); }, 100);
    }
  }
}

function resetLevel() { loadLevel(); }
function updateUI() { document.getElementById('level').textContent = level + 1; document.getElementById('moves').textContent = moves; }
