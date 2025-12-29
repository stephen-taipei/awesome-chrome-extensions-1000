// Color Tap - Popup Script
class ColorTap {
  constructor() {
    this.colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    this.targetColor = '';
    this.score = 0;
    this.best = 0;
    this.timeLeft = 100;
    this.timer = null;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorTapBest'], (r) => {
      this.best = r.colorTapBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('target').addEventListener('click', () => {
      if (!this.playing) this.start();
    });
    this.renderButtons();
  }
  renderButtons() {
    const el = document.getElementById('colors');
    const shuffled = [...this.colors].sort(() => Math.random() - 0.5).slice(0, 4);
    el.innerHTML = shuffled.map(c => `<button class="color-btn" style="background:${c}" data-color="${c}"></button>`).join('');
    el.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => this.tap(btn.dataset.color));
    });
  }
  start() {
    this.score = 0;
    this.timeLeft = 100;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('message').textContent = '';
    this.nextRound();
    this.runTimer();
  }
  nextRound() {
    const shuffled = [...this.colors].sort(() => Math.random() - 0.5).slice(0, 4);
    this.targetColor = shuffled[Math.floor(Math.random() * 4)];
    document.getElementById('target').style.background = this.targetColor;
    document.getElementById('target').textContent = '';
    const el = document.getElementById('colors');
    el.innerHTML = shuffled.map(c => `<button class="color-btn" style="background:${c}" data-color="${c}"></button>`).join('');
    el.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => this.tap(btn.dataset.color));
    });
  }
  tap(color) {
    if (!this.playing) return;
    if (color === this.targetColor) {
      this.score++;
      document.getElementById('score').textContent = this.score;
      this.timeLeft = Math.min(100, this.timeLeft + 10);
      this.nextRound();
    } else {
      this.timeLeft -= 20;
      document.getElementById('message').textContent = 'Wrong!';
      setTimeout(() => document.getElementById('message').textContent = '', 300);
    }
  }
  runTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft -= 2;
      document.getElementById('timerFill').style.width = Math.max(0, this.timeLeft) + '%';
      if (this.timeLeft <= 0) this.end();
    }, 100);
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    document.getElementById('target').style.background = '#334155';
    document.getElementById('target').textContent = 'TAP TO PLAY';
    document.getElementById('message').textContent = 'Game Over! Score: ' + this.score;
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ colorTapBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorTap());
