// Reflex Game - Popup Script
class ReflexGame {
  constructor() {
    this.arrows = [
      { key: 'ArrowLeft', emoji: '⬅️' },
      { key: 'ArrowUp', emoji: '⬆️' },
      { key: 'ArrowDown', emoji: '⬇️' },
      { key: 'ArrowRight', emoji: '➡️' }
    ];
    this.current = null;
    this.score = 0;
    this.best = 0;
    this.timeLeft = 100;
    this.timer = null;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['reflexBest'], (r) => {
      this.best = r.reflexBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.addEventListener('keydown', (e) => this.handleKey(e));
  }
  start() {
    this.score = 0;
    this.timeLeft = 100;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('startBtn').disabled = true;
    this.nextArrow();
    this.runTimer();
  }
  nextArrow() {
    this.current = this.arrows[Math.floor(Math.random() * this.arrows.length)];
    document.getElementById('prompt').textContent = this.current.emoji;
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active', 'correct', 'wrong'));
    document.querySelector(`[data-key="${this.current.key}"]`).classList.add('active');
  }
  handleKey(e) {
    if (!this.playing) return;
    if (!this.arrows.find(a => a.key === e.key)) return;
    e.preventDefault();
    const keyEl = document.querySelector(`[data-key="${e.key}"]`);
    if (e.key === this.current.key) {
      keyEl.classList.add('correct');
      this.score++;
      document.getElementById('score').textContent = this.score;
      this.timeLeft = Math.min(100, this.timeLeft + 5);
      setTimeout(() => this.nextArrow(), 150);
    } else {
      keyEl.classList.add('wrong');
      this.timeLeft -= 15;
      setTimeout(() => keyEl.classList.remove('wrong'), 200);
    }
  }
  runTimer() {
    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      document.getElementById('timerFill').style.width = Math.max(0, this.timeLeft) + '%';
      if (this.timeLeft <= 0) this.end();
    }, 200);
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    document.getElementById('prompt').textContent = '🎮';
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
    document.getElementById('message').textContent = 'Game Over! Score: ' + this.score;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ reflexBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new ReflexGame());
