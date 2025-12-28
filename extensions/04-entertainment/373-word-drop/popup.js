// Word Drop - Popup Script
class WordDrop {
  constructor() {
    this.score = 0;
    this.best = 0;
    this.lives = 3;
    this.letters = [];
    this.playing = false;
    this.spawnInterval = null;
    this.gameLoop = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['wordDropBest'], (r) => {
      this.best = r.wordDropBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.addEventListener('keydown', (e) => this.handleKey(e));
  }
  start() {
    this.score = 0;
    this.lives = 3;
    this.letters = [];
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '❤️❤️❤️';
    document.getElementById('arena').innerHTML = '';
    document.getElementById('startBtn').textContent = 'Playing...';
    document.getElementById('startBtn').disabled = true;
    this.spawnInterval = setInterval(() => this.spawn(), 1200);
    this.gameLoop = setInterval(() => this.update(), 50);
  }
  spawn() {
    if (!this.playing) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = Math.floor(Math.random() * 220) + 10;
    const letter = { char, x, y: -30, speed: 1 + Math.random() * 1.5, el: null };
    const el = document.createElement('div');
    el.className = 'letter';
    el.textContent = char;
    el.style.left = x + 'px';
    el.style.top = '-30px';
    document.getElementById('arena').appendChild(el);
    letter.el = el;
    this.letters.push(letter);
  }
  update() {
    if (!this.playing) return;
    for (let i = this.letters.length - 1; i >= 0; i--) {
      const l = this.letters[i];
      l.y += l.speed;
      l.el.style.top = l.y + 'px';
      if (l.y > 180) {
        l.el.remove();
        this.letters.splice(i, 1);
        this.loseLife();
      }
    }
  }
  handleKey(e) {
    if (!this.playing) return;
    const key = e.key.toUpperCase();
    for (let i = 0; i < this.letters.length; i++) {
      if (this.letters[i].char === key) {
        const l = this.letters[i];
        l.el.classList.add('caught');
        setTimeout(() => l.el.remove(), 300);
        this.letters.splice(i, 1);
        this.score += 10;
        document.getElementById('score').textContent = this.score;
        return;
      }
    }
  }
  loseLife() {
    this.lives--;
    const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
    document.getElementById('lives').textContent = hearts;
    if (this.lives <= 0) this.end();
  }
  end() {
    this.playing = false;
    clearInterval(this.spawnInterval);
    clearInterval(this.gameLoop);
    document.getElementById('startBtn').textContent = 'Play Again';
    document.getElementById('startBtn').disabled = false;
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ wordDropBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new WordDrop());
