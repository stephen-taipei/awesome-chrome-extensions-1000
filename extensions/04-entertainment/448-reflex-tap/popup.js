// Reflex Tap - Popup Script
class ReflexTap {
  constructor() {
    this.score = 0;
    this.best = 0;
    this.timeLeft = 30;
    this.times = [];
    this.targetTime = 0;
    this.gameTimer = null;
    this.targetTimer = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['reflexTapBest'], (r) => {
      this.best = r.reflexTapBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
  }
  startGame() {
    this.score = 0;
    this.timeLeft = 30;
    this.times = [];
    document.getElementById('score').textContent = '0';
    document.getElementById('timer').textContent = '30';
    document.getElementById('avg').textContent = '-';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('arena').innerHTML = '';
    this.gameTimer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('timer').textContent = this.timeLeft;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
    this.spawnTarget();
  }
  spawnTarget() {
    if (this.timeLeft <= 0) return;
    const arena = document.getElementById('arena');
    arena.innerHTML = '';
    const target = document.createElement('div');
    target.className = 'target';
    target.textContent = '🎯';
    target.style.left = (Math.random() * 220 + 40) + 'px';
    target.style.top = (Math.random() * 140 + 30) + 'px';
    this.targetTime = Date.now();
    target.addEventListener('click', () => this.hitTarget());
    arena.appendChild(target);
    this.targetTimer = setTimeout(() => {
      if (this.timeLeft > 0) this.spawnTarget();
    }, 2000);
  }
  hitTarget() {
    const reactionTime = Date.now() - this.targetTime;
    this.times.push(reactionTime);
    this.score++;
    document.getElementById('score').textContent = this.score;
    const avg = Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length);
    document.getElementById('avg').textContent = avg;
    clearTimeout(this.targetTimer);
    this.spawnTarget();
  }
  endGame() {
    clearInterval(this.gameTimer);
    clearTimeout(this.targetTimer);
    document.getElementById('arena').innerHTML = '<div style="padding:80px 20px;font-size:16px;">Game Over!</div>';
    document.getElementById('startBtn').disabled = false;
    if (this.score > this.best) {
      this.best = this.score;
      chrome.storage.local.set({ reflexTapBest: this.best });
      document.getElementById('best').textContent = this.best;
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new ReflexTap());
