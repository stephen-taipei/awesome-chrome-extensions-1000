// Balloon Pop - Popup Script
class BalloonPop {
  constructor() {
    this.colors = ['🎈', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
    this.balloons = [];
    this.score = 0;
    this.best = 0;
    this.time = 30;
    this.gameRunning = false;
    this.interval = null;
    this.spawnInterval = null;
    this.moveInterval = null;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['balloonBest']);
    this.best = data.balloonBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('game').addEventListener('click', (e) => this.pop(e));
  }
  start() {
    this.score = 0;
    this.time = 30;
    this.balloons = [];
    this.gameRunning = true;
    document.getElementById('score').textContent = 0;
    document.getElementById('timer').textContent = 30;
    document.getElementById('game').innerHTML = '';
    document.getElementById('startBtn').style.display = 'none';
    this.interval = setInterval(() => {
      this.time--;
      document.getElementById('timer').textContent = this.time;
      if (this.time <= 0) this.gameOver();
    }, 1000);
    this.spawnInterval = setInterval(() => this.spawn(), 400);
    this.moveInterval = setInterval(() => this.move(), 50);
  }
  spawn() {
    const balloon = {
      x: Math.random() * 216,
      y: 220,
      speed: 1 + Math.random() * 2,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      el: document.createElement('div')
    };
    balloon.el.className = 'balloon';
    balloon.el.textContent = balloon.color;
    balloon.el.style.left = balloon.x + 'px';
    balloon.el.style.top = balloon.y + 'px';
    document.getElementById('game').appendChild(balloon.el);
    this.balloons.push(balloon);
  }
  move() {
    this.balloons.forEach((b, i) => {
      b.y -= b.speed;
      b.el.style.top = b.y + 'px';
      if (b.y < -50) {
        b.el.remove();
        this.balloons.splice(i, 1);
      }
    });
  }
  pop(e) {
    if (!this.gameRunning) return;
    const balloon = e.target;
    if (!balloon.classList.contains('balloon')) return;
    balloon.classList.add('pop');
    this.score++;
    document.getElementById('score').textContent = this.score;
    const idx = this.balloons.findIndex(b => b.el === balloon);
    if (idx > -1) this.balloons.splice(idx, 1);
    setTimeout(() => balloon.remove(), 200);
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    clearInterval(this.spawnInterval);
    clearInterval(this.moveInterval);
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ balloonBest: this.best });
    }
    document.getElementById('startBtn').textContent = `Game Over! Score: ${this.score} - Play Again`;
    document.getElementById('startBtn').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new BalloonPop());
