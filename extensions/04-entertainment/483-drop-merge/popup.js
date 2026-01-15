document.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('game-area');
  const playArea = document.getElementById('play-area');
  const dropper = document.getElementById('dropper');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const newGameBtn = document.getElementById('new-game');

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#a29bfe'];
  const sizes = [20, 30, 40, 50, 60];
  let score = 0, best = 0, balls = [], currentColor = 0, currentSize = 0, gameOver = false;

  const loadBest = () => chrome.storage.local.get(['dropMergeBest'], r => { best = r.dropMergeBest || 0; bestEl.textContent = best; });
  const saveBest = () => { if (score > best) { best = score; chrome.storage.local.set({ dropMergeBest: best }); bestEl.textContent = best; } };

  const newDropper = () => {
    currentColor = Math.floor(Math.random() * colors.length);
    currentSize = Math.floor(Math.random() * 3);
    dropper.style.width = dropper.style.height = `${sizes[currentSize]}px`;
    dropper.style.background = colors[currentColor];
    dropper.style.boxShadow = `0 0 15px ${colors[currentColor]}`;
  };

  const checkMerge = (ball) => {
    balls.forEach(other => {
      if (other !== ball && other.color === ball.color && other.sizeIdx === ball.sizeIdx && !other.merging) {
        const dx = ball.x - other.x, dy = ball.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < sizes[ball.sizeIdx]) {
          other.merging = true; other.el.classList.add('merging');
          setTimeout(() => { other.el.remove(); balls = balls.filter(b => b !== other); }, 300);
          if (ball.sizeIdx < sizes.length - 1) {
            ball.sizeIdx++; const newSize = sizes[ball.sizeIdx];
            ball.el.style.width = ball.el.style.height = `${newSize}px`;
            score += ball.sizeIdx * 50; scoreEl.textContent = score; saveBest();
            setTimeout(() => checkMerge(ball), 350);
          } else { ball.el.classList.add('merging'); setTimeout(() => { ball.el.remove(); balls = balls.filter(b => b !== ball); score += 500; scoreEl.textContent = score; saveBest(); }, 300); }
        }
      }
    });
  };

  const dropBall = (x) => {
    if (gameOver) return;
    const size = sizes[currentSize];
    const ball = { x: x - size/2, y: 0, color: currentColor, sizeIdx: currentSize, merging: false };
    ball.el = document.createElement('div'); ball.el.className = 'ball';
    ball.el.style.width = ball.el.style.height = `${size}px`;
    ball.el.style.left = `${ball.x}px`; ball.el.style.top = `${ball.y}px`;
    ball.el.style.background = colors[currentColor];
    ball.el.style.boxShadow = `0 0 10px ${colors[currentColor]}`;
    playArea.appendChild(ball.el); balls.push(ball);
    let targetY = 300 - size;
    balls.forEach(other => { if (other !== ball && Math.abs(other.x - ball.x) < size) targetY = Math.min(targetY, other.y - size); });
    ball.y = targetY; ball.el.style.top = `${ball.y}px`;
    if (ball.y < 10) { gameOver = true; saveBest(); alert('Game Over! Score: ' + score); return; }
    setTimeout(() => checkMerge(ball), 350); newDropper();
  };

  gameArea.addEventListener('mousemove', e => { const rect = gameArea.getBoundingClientRect(); dropper.style.left = `${Math.max(0, Math.min(280, e.clientX - rect.left - sizes[currentSize]/2))}px`; });
  gameArea.addEventListener('click', e => { const rect = gameArea.getBoundingClientRect(); dropBall(e.clientX - rect.left); });
  newGameBtn.addEventListener('click', () => { score = 0; gameOver = false; scoreEl.textContent = 0; playArea.innerHTML = ''; balls = []; newDropper(); });

  loadBest(); newDropper();
});
