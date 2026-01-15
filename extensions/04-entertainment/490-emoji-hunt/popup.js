document.addEventListener('DOMContentLoaded', () => {
  const gridEl = document.getElementById('grid');
  const targetEmojiEl = document.getElementById('target-emoji');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('best');
  const startBtn = document.getElementById('start-btn');

  const allEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😛', '🤪', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😱', '😨', '😰', '😢', '😭', '😤', '🤬', '👻', '💀', '👽', '🤖', '🎃', '😺', '😸', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
  const gridSize = 64;

  let score = 0, best = 0, timeLeft = 30, targetEmoji = '', gameRunning = false, timer = null;

  const loadBest = () => chrome.storage.local.get(['emojiHuntBest'], r => { best = r.emojiHuntBest || 0; bestEl.textContent = best; });
  const saveBest = () => { if (score > best) { best = score; chrome.storage.local.set({ emojiHuntBest: best }); bestEl.textContent = best; } };

  const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

  const generateGrid = () => {
    targetEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    targetEmojiEl.textContent = targetEmoji;
    const grid = [];
    const targetCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < targetCount; i++) grid.push(targetEmoji);
    const distractors = allEmojis.filter(e => e !== targetEmoji);
    while (grid.length < gridSize) grid.push(distractors[Math.floor(Math.random() * distractors.length)]);
    shuffle(grid);
    renderGrid(grid);
  };

  const renderGrid = (grid) => {
    gridEl.innerHTML = '';
    grid.forEach((emoji, i) => {
      const cell = document.createElement('div');
      cell.className = 'emoji'; cell.textContent = emoji; cell.dataset.idx = i;
      cell.addEventListener('click', () => handleClick(cell, emoji));
      gridEl.appendChild(cell);
    });
  };

  const handleClick = (cell, emoji) => {
    if (!gameRunning) return;
    if (emoji === targetEmoji) {
      cell.classList.add('correct');
      cell.style.visibility = 'hidden';
      score += 10; scoreEl.textContent = score;
      const remaining = document.querySelectorAll(`.emoji:not([style*="hidden"])`);
      const hasTarget = Array.from(remaining).some(e => e.textContent === targetEmoji);
      if (!hasTarget) { score += 50; scoreEl.textContent = score; setTimeout(generateGrid, 300); }
    } else {
      cell.classList.add('wrong');
      score = Math.max(0, score - 5); scoreEl.textContent = score;
      setTimeout(() => cell.classList.remove('wrong'), 300);
    }
  };

  const startGame = () => {
    score = 0; timeLeft = 30; gameRunning = true;
    scoreEl.textContent = 0; timeEl.textContent = 30;
    startBtn.disabled = true;
    generateGrid();
    timer = setInterval(() => {
      timeLeft--; timeEl.textContent = timeLeft;
      if (timeLeft <= 0) { clearInterval(timer); gameRunning = false; saveBest(); startBtn.disabled = false; startBtn.textContent = 'Play Again'; alert(`Time's up! Score: ${score}`); }
    }, 1000);
  };

  startBtn.addEventListener('click', startGame);
  loadBest(); generateGrid();
});
