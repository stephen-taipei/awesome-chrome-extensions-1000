// Hot Cold - Popup Script
class HotCold {
  constructor() {
    this.targetX = 0;
    this.targetY = 0;
    this.clicks = 0;
    this.best = null;
    this.found = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['hotColdBest'], (r) => {
      this.best = r.hotColdBest || null;
      document.getElementById('best').textContent = this.best || '--';
    });
    document.getElementById('arena').addEventListener('click', (e) => this.guess(e));
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.targetX = Math.floor(Math.random() * 236) + 10;
    this.targetY = Math.floor(Math.random() * 160) + 10;
    this.clicks = 0;
    this.found = false;
    document.getElementById('clicks').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('hint').textContent = 'Click to find treasure';
    document.getElementById('arena').className = 'arena';
  }
  guess(e) {
    if (this.found) return;
    const arena = document.getElementById('arena');
    const rect = arena.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.clicks++;
    document.getElementById('clicks').textContent = this.clicks;
    const dist = Math.sqrt((x - this.targetX) ** 2 + (y - this.targetY) ** 2);
    let temp, hint;
    if (dist < 15) {
      this.win();
      return;
    } else if (dist < 30) {
      temp = 'burning'; hint = '🔥 BURNING!';
    } else if (dist < 50) {
      temp = 'hot'; hint = '🔥 Hot!';
    } else if (dist < 80) {
      temp = 'warm'; hint = '☀️ Warm';
    } else if (dist < 120) {
      temp = 'cool'; hint = '❄️ Cool';
    } else if (dist < 160) {
      temp = 'cold'; hint = '🥶 Cold';
    } else {
      temp = 'freezing'; hint = '🧊 Freezing!';
    }
    arena.className = 'arena ' + temp;
    document.getElementById('hint').textContent = hint;
  }
  win() {
    this.found = true;
    document.getElementById('arena').className = 'arena';
    document.getElementById('hint').textContent = '💎 FOUND!';
    document.getElementById('message').textContent = 'Found in ' + this.clicks + ' clicks!';
    if (this.best === null || this.clicks < this.best) {
      this.best = this.clicks;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ hotColdBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new HotCold());
