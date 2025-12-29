// Whack Emoji - Popup Script
class WhackEmoji {
  constructor() {
    this.emojis = ['😀', '😎', '🤪', '😈', '👻', '🤖', '👽', '🐵'];
    this.score = 0;
    this.best = 0;
    this.timeLeft = 30;
    this.timer = null;
    this.spawnTimer = null;
    this.playing = false;
    this.activeHoles = [];
    this.init();
  }
  init() {
    chrome.storage.local.get(['whackEmojiBest'], (r) => {
      this.best = r.whackEmojiBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    this.renderGrid();
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const hole = document.createElement('div');
      hole.className = 'hole';
      hole.dataset.idx = i;
      hole.innerHTML = `<span class="emoji">${this.emojis[i % this.emojis.length]}</span>`;
      hole.addEventListener('click', () => this.whack(i));
      grid.appendChild(hole);
    }
  }
  start() {
    this.score = 0;
    this.timeLeft = 30;
    this.playing = true;
    this.activeHoles = [];
    document.getElementById('score').textContent = '0';
    document.getElementById('time').textContent = '30';
    document.getElementById('startBtn').disabled = true;
    document.querySelectorAll('.emoji').forEach(e => e.classList.remove('visible'));
    this.timer = setInterval(() => this.tick(), 1000);
    this.spawnTimer = setInterval(() => this.spawn(), 600);
  }
  tick() {
    this.timeLeft--;
    document.getElementById('time').textContent = this.timeLeft;
    if (this.timeLeft <= 0) this.end();
  }
  spawn() {
    if (!this.playing) return;
    document.querySelectorAll('.emoji').forEach(e => e.classList.remove('visible'));
    this.activeHoles = [];
    const count = Math.min(3, 1 + Math.floor((30 - this.timeLeft) / 10));
    const indices = [];
    while (indices.length < count) {
      const idx = Math.floor(Math.random() * 9);
      if (!indices.includes(idx)) indices.push(idx);
    }
    indices.forEach(idx => {
      const emoji = document.querySelector(`[data-idx="${idx}"] .emoji`);
      emoji.textContent = this.emojis[Math.floor(Math.random() * this.emojis.length)];
      emoji.classList.add('visible');
      this.activeHoles.push(idx);
    });
  }
  whack(idx) {
    if (!this.playing) return;
    const emoji = document.querySelector(`[data-idx="${idx}"] .emoji`);
    if (this.activeHoles.includes(idx) && emoji.classList.contains('visible')) {
      emoji.classList.add('whacked');
      setTimeout(() => {
        emoji.classList.remove('visible', 'whacked');
      }, 200);
      this.activeHoles = this.activeHoles.filter(h => h !== idx);
      this.score++;
      document.getElementById('score').textContent = this.score;
    }
  }
  end() {
    clearInterval(this.timer);
    clearInterval(this.spawnTimer);
    this.playing = false;
    document.querySelectorAll('.emoji').forEach(e => e.classList.remove('visible'));
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ whackEmojiBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new WhackEmoji());
