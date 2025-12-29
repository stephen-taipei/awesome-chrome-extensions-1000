// Fruit Slice - Popup Script
class FruitSlice {
  constructor() {
    this.fruits = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍉', '🍌', '🥭'];
    this.items = [];
    this.score = 0;
    this.best = 0;
    this.lives = 3;
    this.gameRunning = false;
    this.spawnInterval = null;
    this.moveInterval = null;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['fruitBest']);
    this.best = data.fruitBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('game').addEventListener('mousedown', (e) => this.slice(e));
    document.getElementById('game').addEventListener('mousemove', (e) => { if (e.buttons === 1) this.slice(e); });
  }
  start() {
    this.score = 0;
    this.lives = 3;
    this.items = [];
    this.gameRunning = true;
    document.getElementById('score').textContent = 0;
    document.getElementById('lives').textContent = '❤️❤️❤️';
    document.getElementById('game').innerHTML = '';
    document.getElementById('startBtn').style.display = 'none';
    this.spawnInterval = setInterval(() => this.spawn(), 600);
    this.moveInterval = setInterval(() => this.move(), 30);
  }
  spawn() {
    const isBomb = Math.random() < 0.15;
    const item = {
      x: Math.random() * 200 + 28,
      y: 240,
      vx: (Math.random() - 0.5) * 4,
      vy: -8 - Math.random() * 4,
      isBomb,
      emoji: isBomb ? '💣' : this.fruits[Math.floor(Math.random() * this.fruits.length)],
      el: document.createElement('div'),
      sliced: false
    };
    item.el.className = 'fruit' + (isBomb ? ' bomb' : '');
    item.el.textContent = item.emoji;
    item.el.style.left = item.x + 'px';
    item.el.style.top = item.y + 'px';
    document.getElementById('game').appendChild(item.el);
    this.items.push(item);
  }
  move() {
    this.items.forEach((item, i) => {
      if (item.sliced) return;
      item.vy += 0.3;
      item.x += item.vx;
      item.y += item.vy;
      item.el.style.left = item.x + 'px';
      item.el.style.top = item.y + 'px';
      if (item.y > 240) {
        if (!item.isBomb && !item.sliced) {
          this.lives--;
          this.updateLives();
          if (this.lives <= 0) this.gameOver();
        }
        item.el.remove();
        this.items.splice(i, 1);
      }
    });
  }
  slice(e) {
    if (!this.gameRunning) return;
    const rect = document.getElementById('game').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.items.forEach((item, i) => {
      if (item.sliced) return;
      const dx = x - item.x - 18;
      const dy = y - item.y - 18;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        item.sliced = true;
        item.el.classList.add('sliced');
        if (item.isBomb) {
          this.gameOver();
        } else {
          this.score++;
          document.getElementById('score').textContent = this.score;
          this.addSplash(item.x, item.y);
        }
        setTimeout(() => { item.el.remove(); this.items.splice(i, 1); }, 300);
      }
    });
  }
  addSplash(x, y) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.textContent = '💥';
    splash.style.left = x + 'px';
    splash.style.top = y + 'px';
    document.getElementById('game').appendChild(splash);
    setTimeout(() => splash.remove(), 500);
  }
  updateLives() {
    document.getElementById('lives').textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.spawnInterval);
    clearInterval(this.moveInterval);
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ fruitBest: this.best });
    }
    document.getElementById('startBtn').textContent = `Game Over! Score: ${this.score} - Play Again`;
    document.getElementById('startBtn').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new FruitSlice());
