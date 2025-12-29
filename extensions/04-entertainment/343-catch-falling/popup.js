// Catch Falling - Popup Script
class CatchFalling {
  constructor() {
    this.score = 0;
    this.lives = 3;
    this.basketX = 103;
    this.items = [];
    this.emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑'];
    this.gameRunning = false;
    this.interval = null;
    this.spawnInterval = null;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('restartBtn').addEventListener('click', () => this.start());
    document.addEventListener('keydown', (e) => this.handleKey(e));
  }
  start() {
    this.score = 0;
    this.lives = 3;
    this.basketX = 103;
    this.items = [];
    this.gameRunning = true;
    document.getElementById('score').textContent = 0;
    document.getElementById('lives').textContent = 3;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('basket').style.left = this.basketX + 'px';
    this.clearItems();
    this.interval = setInterval(() => this.tick(), 50);
    this.spawnInterval = setInterval(() => this.spawn(), 800);
  }
  handleKey(e) {
    if (!this.gameRunning) return;
    if (e.key === 'ArrowLeft') this.basketX = Math.max(0, this.basketX - 20);
    if (e.key === 'ArrowRight') this.basketX = Math.min(206, this.basketX + 20);
    document.getElementById('basket').style.left = this.basketX + 'px';
  }
  spawn() {
    const item = {
      x: Math.random() * 232,
      y: -24,
      emoji: this.emojis[Math.floor(Math.random() * this.emojis.length)],
      el: document.createElement('div')
    };
    item.el.className = 'item';
    item.el.textContent = item.emoji;
    item.el.style.left = item.x + 'px';
    item.el.style.top = item.y + 'px';
    document.getElementById('game').appendChild(item.el);
    this.items.push(item);
  }
  tick() {
    this.items.forEach((item, i) => {
      item.y += 4;
      item.el.style.top = item.y + 'px';
      if (item.y > 200 && item.y < 230 && item.x + 12 > this.basketX && item.x + 12 < this.basketX + 50) {
        this.score++;
        document.getElementById('score').textContent = this.score;
        item.el.remove();
        this.items.splice(i, 1);
      } else if (item.y > 240) {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        item.el.remove();
        this.items.splice(i, 1);
        if (this.lives <= 0) this.gameOver();
      }
    });
  }
  clearItems() {
    document.querySelectorAll('.item').forEach(el => el.remove());
    this.items = [];
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    clearInterval(this.spawnInterval);
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameOver').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new CatchFalling());
