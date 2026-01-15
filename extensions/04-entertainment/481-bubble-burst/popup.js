document.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('game-area');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const newGameBtn = document.getElementById('new-game');

  let score = 0;
  let best = 0;
  let bubbles = [];
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];

  const loadBest = () => {
    chrome.storage.local.get(['bubbleBurstBest'], (result) => {
      best = result.bubbleBurstBest || 0;
      bestEl.textContent = best;
    });
  };

  const saveBest = () => {
    if (score > best) {
      best = score;
      chrome.storage.local.set({ bubbleBurstBest: best });
      bestEl.textContent = best;
    }
  };

  const createBubble = () => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = 30 + Math.random() * 40;
    const color = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * (320 - size)}px`;
    bubble.style.top = `${Math.random() * (320 - size)}px`;
    bubble.style.backgroundColor = color;
    bubble.style.boxShadow = `0 0 10px ${color}, inset 0 0 20px rgba(255,255,255,0.3)`;
    bubble.dataset.points = Math.round(70 - size);
    bubble.addEventListener('click', popBubble);
    gameArea.appendChild(bubble);
    bubbles.push(bubble);
  };

  const popBubble = (e) => {
    const bubble = e.target;
    const points = parseInt(bubble.dataset.points);
    score += points;
    scoreEl.textContent = score;
    bubble.classList.add('pop');
    bubble.removeEventListener('click', popBubble);
    setTimeout(() => {
      bubble.remove();
      bubbles = bubbles.filter(b => b !== bubble);
      if (bubbles.length === 0) {
        saveBest();
        spawnBubbles();
      }
    }, 300);
  };

  const spawnBubbles = () => {
    const count = 10 + Math.floor(score / 100);
    for (let i = 0; i < Math.min(count, 20); i++) {
      setTimeout(() => createBubble(), i * 50);
    }
  };

  const startGame = () => {
    score = 0;
    scoreEl.textContent = score;
    gameArea.innerHTML = '';
    bubbles = [];
    spawnBubbles();
  };

  newGameBtn.addEventListener('click', startGame);
  loadBest();
  startGame();
});
