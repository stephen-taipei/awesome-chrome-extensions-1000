document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const heightEl = document.getElementById('height');
  const bestEl = document.getElementById('best');
  const dropBtn = document.getElementById('drop-btn');

  let bricks = [], currentBrick = null, height = 0, best = 0, gameOver = false;
  const brickHeight = 25, groundY = 340;
  const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c'];

  const loadBest = () => chrome.storage.local.get(['brickStackBest'], r => { best = r.brickStackBest || 0; bestEl.textContent = best; });
  const saveBest = () => { if (height > best) { best = height; chrome.storage.local.set({ brickStackBest: best }); bestEl.textContent = best; } };

  const createBrick = () => {
    const prevBrick = bricks[bricks.length - 1];
    const width = prevBrick ? prevBrick.width : 100;
    currentBrick = { x: 0, y: 30, width, dir: 1, speed: 2 + height * 0.3, color: colors[height % colors.length] };
  };

  const draw = () => {
    ctx.clearRect(0, 0, 320, 360);
    ctx.fillStyle = '#8b4513'; ctx.fillRect(0, groundY, 320, 20);
    const offset = Math.max(0, (bricks.length * brickHeight) - 280);
    bricks.forEach((b, i) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, groundY - (i + 1) * brickHeight + offset, b.width, brickHeight - 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.strokeRect(b.x, groundY - (i + 1) * brickHeight + offset, b.width, brickHeight - 2);
    });
    if (currentBrick && !gameOver) {
      ctx.fillStyle = currentBrick.color;
      ctx.fillRect(currentBrick.x, currentBrick.y, currentBrick.width, brickHeight - 2);
    }
    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 320, 360);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Segoe UI'; ctx.textAlign = 'center';
      ctx.fillText('Game Over!', 160, 160);
      ctx.font = '18px Segoe UI'; ctx.fillText(`Height: ${height}`, 160, 200);
      dropBtn.textContent = 'New Game';
    }
  };

  const update = () => {
    if (currentBrick && !gameOver) {
      currentBrick.x += currentBrick.speed * currentBrick.dir;
      if (currentBrick.x <= 0 || currentBrick.x >= 320 - currentBrick.width) currentBrick.dir *= -1;
    }
    draw(); requestAnimationFrame(update);
  };

  const dropBrick = () => {
    if (gameOver) { startGame(); return; }
    if (!currentBrick) return;
    const prev = bricks[bricks.length - 1];
    if (prev) {
      const left = Math.max(currentBrick.x, prev.x);
      const right = Math.min(currentBrick.x + currentBrick.width, prev.x + prev.width);
      const overlap = right - left;
      if (overlap <= 0) { gameOver = true; saveBest(); draw(); return; }
      currentBrick.x = left; currentBrick.width = overlap;
    }
    bricks.push({ ...currentBrick }); height = bricks.length; heightEl.textContent = height;
    createBrick();
  };

  const startGame = () => {
    bricks = []; height = 0; gameOver = false;
    heightEl.textContent = 0; dropBtn.textContent = 'Drop Brick';
    createBrick();
  };

  dropBtn.addEventListener('click', dropBrick);
  canvas.addEventListener('click', dropBrick);
  loadBest(); startGame(); update();
});
