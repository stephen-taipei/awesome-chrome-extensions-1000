let mode = 'numbers', level = 1, best = 0, nextIndex = 0, items = [];

chrome.storage.local.get(['tapSeqBest'], r => { best = r.tapSeqBest || 0; document.getElementById('best').textContent = best; });

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function generateItems() {
  const count = Math.min(4 + level, 16);
  if (mode === 'numbers') items = Array.from({ length: count }, (_, i) => i + 1);
  else items = 'ABCDEFGHIJKLMNOP'.slice(0, count).split('');
  return shuffle([...items]);
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const shuffled = generateItems();
  grid.innerHTML = '';
  shuffled.forEach(item => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = item;
    cell.addEventListener('click', () => handleTap(cell, item));
    grid.appendChild(cell);
  });
  nextIndex = 0;
  document.getElementById('message').textContent = '';
}

function handleTap(cell, item) {
  const expected = items[nextIndex];
  if (item === expected) {
    cell.classList.add('correct');
    cell.style.pointerEvents = 'none';
    nextIndex++;
    if (nextIndex === items.length) {
      level++;
      document.getElementById('level').textContent = level;
      if (level > best) { best = level; chrome.storage.local.set({ tapSeqBest: best }); document.getElementById('best').textContent = best; }
      document.getElementById('message').textContent = 'Level Complete!';
      setTimeout(renderGrid, 800);
    }
  } else {
    cell.classList.add('wrong');
    document.getElementById('message').textContent = 'Wrong! Try again';
    level = 1;
    document.getElementById('level').textContent = level;
    setTimeout(renderGrid, 1000);
  }
}

document.querySelectorAll('.mode').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    level = 1;
    document.getElementById('level').textContent = level;
    renderGrid();
  });
});

renderGrid();
