// Word Rain - Popup Script
class WordRain {
  constructor() {
    this.wordList = ['CAT', 'DOG', 'SUN', 'RUN', 'FLY', 'SKY', 'RED', 'BLUE', 'FAST', 'SLOW', 'JUMP', 'TREE', 'BIRD', 'FISH', 'STAR', 'MOON', 'RAIN', 'SNOW', 'WIND', 'FIRE', 'ROCK', 'WAVE', 'LEAF', 'FROG', 'BEAR'];
    this.words = [];
    this.score = 0;
    this.best = 0;
    this.lives = 3;
    this.playing = false;
    this.spawnInterval = null;
    this.gameLoop = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['wordRainBest'], (r) => {
      this.best = r.wordRainBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('input').addEventListener('input', (e) => this.checkInput(e));
  }
  start() {
    this.score = 0;
    this.lives = 3;
    this.words = [];
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '❤️❤️❤️';
    document.getElementById('arena').innerHTML = '';
    document.getElementById('input').value = '';
    document.getElementById('input').focus();
    document.getElementById('startBtn').disabled = true;
    this.spawnInterval = setInterval(() => this.spawn(), 1500);
    this.gameLoop = setInterval(() => this.update(), 50);
  }
  spawn() {
    if (!this.playing) return;
    const text = this.wordList[Math.floor(Math.random() * this.wordList.length)];
    const x = Math.floor(Math.random() * 180) + 10;
    const word = { text, x, y: -20, speed: 0.8 + Math.random() * 0.6, el: null };
    const el = document.createElement('div');
    el.className = 'word';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = '-20px';
    document.getElementById('arena').appendChild(el);
    word.el = el;
    this.words.push(word);
  }
  update() {
    if (!this.playing) return;
    for (let i = this.words.length - 1; i >= 0; i--) {
      const w = this.words[i];
      w.y += w.speed;
      w.el.style.top = w.y + 'px';
      if (w.y > 160) {
        w.el.remove();
        this.words.splice(i, 1);
        this.loseLife();
      }
    }
  }
  checkInput(e) {
    if (!this.playing) return;
    const typed = e.target.value.toUpperCase();
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i].text === typed) {
        const w = this.words[i];
        w.el.classList.add('matched');
        setTimeout(() => w.el.remove(), 300);
        this.words.splice(i, 1);
        this.score += typed.length;
        document.getElementById('score').textContent = this.score;
        document.getElementById('input').value = '';
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
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ wordRainBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new WordRain());
