const PATTERNS = [
  ['🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🪷', '💐', '🌿'],
  ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒', '🥭'],
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨'],
  ['⭐', '🌙', '☀️', '⚡', '🌈', '❄️', '🔥', '💧', '🌊'],
  ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎸']
];
let pattern = [], puzzle = [], moves = 0, best = null, selected = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['photoPuzzleBest']);
  best = data.photoPuzzleBest || null;
  document.getElementById('best').textContent = best || '-';
  document.getElementById('newGame').addEventListener('click', newGame);
  newGame();
}

function newGame() {
  pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)].slice();
  puzzle = [...pattern];
  shufflePuzzle();
  moves = 0; selected = null;
  updateMoves();
  renderPreview();
  render();
}

function shufflePuzzle() {
  for (let i = puzzle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
  }
  if (puzzle.every((p, i) => p === pattern[i])) shufflePuzzle();
}

function renderPreview() {
  const container = document.getElementById('preview');
  container.innerHTML = '';
  pattern.forEach(emoji => {
    const el = document.createElement('div');
    el.textContent = emoji;
    container.appendChild(el);
  });
}

function render() {
  const container = document.getElementById('puzzle');
  container.innerHTML = '';
  puzzle.forEach((emoji, i) => {
    const piece = document.createElement('div');
    piece.className = 'piece';
    if (emoji === pattern[i]) piece.classList.add('correct');
    if (selected === i) piece.classList.add('selected');
    piece.textContent = emoji;
    piece.addEventListener('click', () => handleClick(i));
    container.appendChild(piece);
  });
}

function handleClick(idx) {
  if (selected === null) {
    selected = idx;
  } else if (selected === idx) {
    selected = null;
  } else {
    [puzzle[selected], puzzle[idx]] = [puzzle[idx], puzzle[selected]];
    moves++;
    updateMoves();
    selected = null;
    checkWin();
  }
  render();
}

function checkWin() {
  if (puzzle.every((p, i) => p === pattern[i])) {
    if (best === null || moves < best) {
      best = moves;
      document.getElementById('best').textContent = best;
      chrome.storage.local.set({ photoPuzzleBest: best });
    }
    setTimeout(() => alert(`Solved in ${moves} moves!`), 100);
  }
}

function updateMoves() {
  document.getElementById('moves').textContent = moves;
}
