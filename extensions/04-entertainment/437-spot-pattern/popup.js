// Spot Pattern - Popup Script
class SpotPattern {
  constructor() {
    this.score = 0;
    this.timer = 0;
    this.oddIndex = -1;
    this.interval = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['spotPatternScore'], (r) => {
      this.score = r.spotPatternScore || 0;
      this.updateStats();
    });
    this.newPuzzle();
  }
  newPuzzle() {
    clearInterval(this.interval);
    this.timer = 0;
    this.interval = setInterval(() => {
      this.timer++;
      document.getElementById('timer').textContent = this.timer;
    }, 1000);
    const emojis = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠', '⬛', '⬜', '🔶', '🔷'];
    const shapes = ['●', '■', '▲', '◆', '★', '♦', '♠', '♣', '♥'];
    const type = Math.random() > 0.5 ? 'emoji' : 'shape';
    let normal, odd;
    if (type === 'emoji') {
      const pair = emojis.sort(() => Math.random() - 0.5).slice(0, 2);
      normal = pair[0];
      odd = pair[1];
    } else {
      const pair = shapes.sort(() => Math.random() - 0.5).slice(0, 2);
      normal = pair[0];
      odd = pair[1];
    }
    this.oddIndex = Math.floor(Math.random() * 25);
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = i === this.oddIndex ? odd : normal;
      cell.dataset.index = i;
      cell.addEventListener('click', () => this.check(i));
      grid.appendChild(cell);
    }
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  check(index) {
    const fb = document.getElementById('feedback');
    if (index === this.oddIndex) {
      clearInterval(this.interval);
      const bonus = Math.max(10, 50 - this.timer * 2);
      this.score += bonus;
      chrome.storage.local.set({ spotPatternScore: this.score });
      fb.textContent = `✓ Found in ${this.timer}s! +${bonus}`;
      fb.className = 'feedback correct';
      this.updateStats();
      setTimeout(() => this.newPuzzle(), 1000);
    } else {
      fb.textContent = '✗ Not that one!';
      fb.className = 'feedback wrong';
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
  }
}
document.addEventListener('DOMContentLoaded', () => new SpotPattern());
