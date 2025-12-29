// Spot Difference - Popup Script
class SpotDifference {
  constructor() {
    this.emojis = ['😀', '😎', '🥳', '😍', '🤩', '😊', '🤗', '😇', '🐶', '🐱', '🐼', '🦊', '🦁', '🐸', '🐵', '🦄', '🌸', '🌺', '🌻', '🌹', '⭐', '🌙', '☀️', '🔥', '❤️', '💎', '🎈', '🎉'];
    this.score = 0;
    this.best = 0;
    this.time = 30;
    this.differentIdx = -1;
    this.gameRunning = false;
    this.interval = null;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['spotBest']);
    this.best = data.spotBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('grid').addEventListener('click', (e) => this.handleClick(e));
  }
  start() {
    this.score = 0;
    this.time = 30;
    this.gameRunning = true;
    document.getElementById('score').textContent = 0;
    document.getElementById('timer').textContent = 30;
    document.getElementById('result').textContent = '';
    document.getElementById('startBtn').textContent = 'Playing...';
    document.getElementById('startBtn').disabled = true;
    this.newRound();
    this.interval = setInterval(() => {
      this.time--;
      document.getElementById('timer').textContent = this.time;
      if (this.time <= 0) this.gameOver();
    }, 1000);
  }
  newRound() {
    const baseEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    let diffEmoji;
    do {
      diffEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    } while (diffEmoji === baseEmoji);
    this.differentIdx = Math.floor(Math.random() * 16);
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.idx = i;
      cell.textContent = i === this.differentIdx ? diffEmoji : baseEmoji;
      grid.appendChild(cell);
    }
  }
  handleClick(e) {
    if (!this.gameRunning) return;
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    const idx = parseInt(cell.dataset.idx);
    const result = document.getElementById('result');
    if (idx === this.differentIdx) {
      cell.classList.add('correct');
      result.textContent = '✓ Correct!';
      result.className = 'result correct';
      this.score++;
      document.getElementById('score').textContent = this.score;
      setTimeout(() => {
        result.textContent = '';
        this.newRound();
      }, 500);
    } else {
      cell.classList.add('wrong');
      result.textContent = '✗ Wrong!';
      result.className = 'result wrong';
      setTimeout(() => {
        cell.classList.remove('wrong');
        result.textContent = '';
      }, 500);
    }
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ spotBest: this.best });
    }
    document.getElementById('result').textContent = `Game Over! Score: ${this.score}`;
    document.getElementById('result').className = 'result';
    document.getElementById('startBtn').textContent = 'Play Again';
    document.getElementById('startBtn').disabled = false;
  }
}
document.addEventListener('DOMContentLoaded', () => new SpotDifference());
