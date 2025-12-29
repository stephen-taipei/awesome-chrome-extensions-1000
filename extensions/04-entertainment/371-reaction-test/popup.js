// Reaction Test - Popup Script
class ReactionTest {
  constructor() {
    this.state = 'waiting';
    this.startTime = 0;
    this.timeout = null;
    this.attempts = [];
    this.best = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['reactionBest'], (r) => {
      this.best = r.reactionBest || null;
      document.getElementById('best').textContent = this.best ? this.best + 'ms' : '--';
    });
    document.getElementById('box').addEventListener('click', () => this.handleClick());
  }
  handleClick() {
    const box = document.getElementById('box');
    if (this.state === 'waiting' || this.state === 'result' || this.state === 'early') {
      this.state = 'ready';
      box.className = 'box ready';
      box.textContent = 'Wait for green...';
      document.getElementById('result').textContent = '';
      const delay = 1000 + Math.random() * 3000;
      this.timeout = setTimeout(() => {
        this.state = 'go';
        box.className = 'box go';
        box.textContent = 'CLICK!';
        this.startTime = Date.now();
      }, delay);
    } else if (this.state === 'ready') {
      clearTimeout(this.timeout);
      this.state = 'early';
      box.className = 'box early';
      box.textContent = 'Too early! Click to retry';
      document.getElementById('result').textContent = '';
    } else if (this.state === 'go') {
      const time = Date.now() - this.startTime;
      this.attempts.push(time);
      if (this.attempts.length > 5) this.attempts.shift();
      this.state = 'result';
      box.className = 'box result';
      box.textContent = time + 'ms';
      this.renderAttempts();
      if (this.best === null || time < this.best) {
        this.best = time;
        document.getElementById('best').textContent = this.best + 'ms';
        chrome.storage.local.set({ reactionBest: this.best });
        document.getElementById('result').textContent = 'New Record!';
      } else {
        document.getElementById('result').textContent = 'Click to try again';
      }
    }
  }
  renderAttempts() {
    const el = document.getElementById('attempts');
    el.innerHTML = this.attempts.map(t => `<span class="attempt">${t}ms</span>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new ReactionTest());
