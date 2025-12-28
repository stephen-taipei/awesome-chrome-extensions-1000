// Reaction Test - Popup Script
class ReactionTest {
  constructor() {
    this.state = 'waiting';
    this.startTime = 0;
    this.timeout = null;
    this.times = [];
    this.best = null;
    this.init();
  }
  init() {
    document.getElementById('box').addEventListener('click', () => this.handleClick());
    this.loadStats();
  }
  handleClick() {
    const box = document.getElementById('box');
    if (this.state === 'waiting') {
      this.state = 'ready';
      box.className = 'box ready';
      box.textContent = 'Wait for green...';
      this.timeout = setTimeout(() => {
        this.state = 'go';
        box.className = 'box go';
        box.textContent = 'CLICK NOW!';
        this.startTime = Date.now();
      }, Math.random() * 3000 + 1000);
    } else if (this.state === 'ready') {
      clearTimeout(this.timeout);
      this.state = 'early';
      box.className = 'box early';
      box.textContent = 'Too early! Click to retry';
      document.getElementById('result').textContent = '';
      setTimeout(() => {
        this.state = 'waiting';
        box.className = 'box waiting';
        box.textContent = 'Click when green!';
      }, 1500);
    } else if (this.state === 'go') {
      const reactionTime = Date.now() - this.startTime;
      this.times.push(reactionTime);
      if (this.times.length > 5) this.times.shift();
      if (!this.best || reactionTime < this.best) this.best = reactionTime;
      document.getElementById('result').textContent = `${reactionTime} ms`;
      this.updateStats();
      this.saveStats();
      this.state = 'waiting';
      box.className = 'box result';
      box.textContent = 'Click to try again';
      setTimeout(() => {
        box.className = 'box waiting';
        box.textContent = 'Click when green!';
      }, 2000);
    }
  }
  updateStats() {
    document.getElementById('best').textContent = this.best ? `${this.best}ms` : '-';
    const avg = this.times.length > 0 ? Math.round(this.times.reduce((a,b) => a+b, 0) / this.times.length) : null;
    document.getElementById('avg').textContent = avg ? `${avg}ms` : '-';
  }
  saveStats() { chrome.storage.local.set({ reactionStats: { best: this.best, times: this.times } }); }
  loadStats() {
    chrome.storage.local.get(['reactionStats'], (r) => {
      if (r.reactionStats) {
        this.best = r.reactionStats.best;
        this.times = r.reactionStats.times || [];
        this.updateStats();
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new ReactionTest());
