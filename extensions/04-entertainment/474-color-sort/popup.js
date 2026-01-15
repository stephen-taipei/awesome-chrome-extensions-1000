const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
let tubes = [], selected = null, moves = 0, level = 1;

function init() {
  chrome.storage.local.get(['colorSortLevel'], (r) => { level = r.colorSortLevel || 1; generateLevel(); });
}

function generateLevel() {
  const numColors = Math.min(3 + Math.floor(level / 2), 6);
  const numTubes = numColors + 2;
  let balls = [];
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < 4; j++) balls.push(colors[i]);
  }
  balls = balls.sort(() => Math.random() - 0.5);
  tubes = [];
  for (let i = 0; i < numColors; i++) tubes.push(balls.splice(0, 4));
  for (let i = 0; i < 2; i++) tubes.push([]);
  selected = null; moves = 0;
  document.getElementById('moves').textContent = '0';
  document.getElementById('level').textContent = level;
  render();
}

function render() {
  const container = document.getElementById('tubes');
  container.innerHTML = '';
  tubes.forEach((tube, i) => {
    const el = document.createElement('div');
    el.className = 'tube' + (selected === i ? ' selected' : '');
    tube.forEach(color => {
      const ball = document.createElement('div');
      ball.className = 'ball';
      ball.style.background = `radial-gradient(circle at 30% 30%, ${lighten(color)}, ${color})`;
      el.appendChild(ball);
    });
    el.addEventListener('click', () => clickTube(i));
    container.appendChild(el);
  });
}

function lighten(color) {
  const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
  return `rgb(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)})`;
}

function clickTube(i) {
  if (selected === null) {
    if (tubes[i].length > 0) { selected = i; render(); }
  } else if (selected === i) {
    selected = null; render();
  } else {
    if (canMove(selected, i)) {
      tubes[i].push(tubes[selected].pop());
      moves++;
      document.getElementById('moves').textContent = moves;
      if (checkWin()) {
        level++;
        chrome.storage.local.set({ colorSortLevel: level });
        setTimeout(() => { alert('Level Complete!'); generateLevel(); }, 200);
      }
    }
    selected = null; render();
  }
}

function canMove(from, to) {
  if (tubes[from].length === 0) return false;
  if (tubes[to].length >= 4) return false;
  if (tubes[to].length === 0) return true;
  return tubes[to][tubes[to].length-1] === tubes[from][tubes[from].length-1];
}

function checkWin() {
  return tubes.every(t => t.length === 0 || (t.length === 4 && t.every(c => c === t[0])));
}

document.getElementById('restart').addEventListener('click', generateLevel);
init();
