let pattern = [], userPattern = [], level = 1, best = 1, phase = 'idle';

function init() {
  chrome.storage.local.get(['patternLockBest'], (r) => {
    best = r.patternLockBest || 1;
    document.getElementById('best').textContent = best;
  });
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const node = document.createElement('div');
    node.className = 'node';
    node.innerHTML = '<div class="dot"></div>';
    node.addEventListener('click', () => nodeClick(i));
    grid.appendChild(node);
  }
}

function nodeClick(i) {
  if (phase !== 'input') return;
  userPattern.push(i);
  const nodes = document.querySelectorAll('.node');
  const expected = pattern[userPattern.length - 1];
  if (i === expected) {
    nodes[i].classList.add('correct');
    if (userPattern.length === pattern.length) {
      phase = 'idle';
      document.getElementById('status').textContent = 'Correct! Next level...';
      level++;
      document.getElementById('level').textContent = level;
      if (level > best) {
        best = level;
        chrome.storage.local.set({ patternLockBest: best });
        document.getElementById('best').textContent = best;
      }
      setTimeout(() => startRound(), 1000);
    }
  } else {
    nodes[i].classList.add('wrong');
    phase = 'idle';
    document.getElementById('status').textContent = 'Wrong! Try again...';
    level = 1;
    document.getElementById('level').textContent = '1';
    setTimeout(() => {
      document.querySelectorAll('.node').forEach(n => n.classList.remove('correct', 'wrong', 'active'));
      document.getElementById('status').textContent = 'Press Start';
    }, 1000);
  }
}

function startRound() {
  pattern = [];
  userPattern = [];
  const len = 2 + Math.floor(level / 2);
  for (let i = 0; i < len; i++) pattern.push(Math.floor(Math.random() * 9));
  document.querySelectorAll('.node').forEach(n => n.classList.remove('correct', 'wrong', 'active'));
  document.getElementById('status').textContent = 'Watch the pattern...';
  phase = 'showing';
  showPattern(0);
}

function showPattern(i) {
  if (i >= pattern.length) {
    phase = 'input';
    document.getElementById('status').textContent = 'Your turn!';
    return;
  }
  const nodes = document.querySelectorAll('.node');
  nodes[pattern[i]].classList.add('active');
  setTimeout(() => {
    nodes[pattern[i]].classList.remove('active');
    setTimeout(() => showPattern(i + 1), 200);
  }, 500);
}

document.getElementById('start').addEventListener('click', () => {
  level = 1;
  document.getElementById('level').textContent = '1';
  startRound();
});
init();
