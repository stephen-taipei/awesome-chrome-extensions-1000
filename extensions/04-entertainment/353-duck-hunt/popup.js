// Duck Hunt - Popup Script
class DuckHunt {
  constructor() {
    this.ducks = [];
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
    const data = await chrome.storage.local.get(['duckBest']);
    this.best = data.duckBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('game').addEventListener('click', (e) => this.shoot(e));
  }
  start() {
    this.score = 0;
    this.time = 30;
    this.ducks = [];
    this.gameRunning = true;
    document.getElementById('score').textContent = 0;
    document.getElementById('timer').textContent = 30;
    document.getElementById('game').innerHTML = '';
    document.getElementById('startBtn').style.display = 'none';
    this.addClouds();
    this.interval = setInterval(() => {
      this.time--;
      document.getElementById('timer').textContent = this.time;
      if (this.time <= 0) this.gameOver();
    }, 1000);
    this.spawnInterval = setInterval(() => this.spawn(), 800);
    this.moveInterval = setInterval(() => this.move(), 50);
  }
  addClouds() {
    for (let i = 0; i < 3; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      cloud.textContent = '☁️';
      cloud.style.left = (Math.random() * 200) + 'px';
      cloud.style.top = (Math.random() * 60) + 'px';
      document.getElementById('game').appendChild(cloud);
    }
  }
  spawn() {
    const duck = {
      x: Math.random() < 0.5 ? -30 : 286,
      y: Math.random() * 80 + 20,
      dir: 0,
      speed: 2 + Math.random() * 2,
      el: document.createElement('div')
    };
    duck.dir = duck.x < 0 ? 1 : -1;
    duck.el.className = 'duck';
    duck.el.textContent = '🦆';
    duck.el.style.left = duck.x + 'px';
    duck.el.style.top = duck.y + 'px';
    duck.el.style.transform = duck.dir < 0 ? 'scaleX(-1)' : '';
    document.getElementById('game').appendChild(duck.el);
    this.ducks.push(duck);
  }
  move() {
    this.ducks.forEach((d, i) => {
      d.x += d.speed * d.dir;
      d.y += (Math.random() - 0.5) * 2;
      d.y = Math.max(10, Math.min(80, d.y));
      d.el.style.left = d.x + 'px';
      d.el.style.top = d.y + 'px';
      if (d.x < -40 || d.x > 296) {
        d.el.remove();
        this.ducks.splice(i, 1);
      }
    });
  }
  shoot(e) {
    if (!this.gameRunning) return;
    const duck = e.target;
    if (!duck.classList.contains('duck') || duck.classList.contains('hit')) return;
    duck.classList.add('hit');
    this.score++;
    document.getElementById('score').textContent = this.score;
    const idx = this.ducks.findIndex(d => d.el === duck);
    if (idx > -1) this.ducks.splice(idx, 1);
    setTimeout(() => duck.remove(), 500);
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    clearInterval(this.spawnInterval);
    clearInterval(this.moveInterval);
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ duckBest: this.best });
    }
    document.getElementById('startBtn').textContent = `Game Over! Score: ${this.score} - Play Again`;
    document.getElementById('startBtn').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new DuckHunt());
