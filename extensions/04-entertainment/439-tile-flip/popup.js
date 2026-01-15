// Tile Flip - Popup Script
class TileFlip {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.target = [];
    this.player = [];
    this.size = 16;
    this.init();
  }
  init() {
    chrome.storage.local.get(['tileFlipScore', 'tileFlipLevel'], (r) => {
      this.score = r.tileFlipScore || 0;
      this.level = r.tileFlipLevel || 1;
      this.updateStats();
    });
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
    this.newPuzzle();
  }
  newPuzzle() {
    const onCount = Math.min(3 + this.level, 10);
    this.target = Array(this.size).fill(false);
    const indices = [];
    while (indices.length < onCount) {
      const i = Math.floor(Math.random() * this.size);
      if (!indices.includes(i)) indices.push(i);
    }
    indices.forEach(i => this.target[i] = true);
    this.player = Array(this.size).fill(false);
    this.render();
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  render() {
    const targetEl = document.getElementById('target');
    const playerEl = document.getElementById('player');
    targetEl.innerHTML = this.target.map((on, i) =>
      `<div class="tile ${on ? 'on' : 'off'}" data-i="${i}"></div>`
    ).join('');
    playerEl.innerHTML = this.player.map((on, i) =>
      `<div class="tile ${on ? 'on' : 'off'}" data-i="${i}"></div>`
    ).join('');
    playerEl.querySelectorAll('.tile').forEach(tile => {
      tile.addEventListener('click', () => this.toggle(parseInt(tile.dataset.i)));
    });
  }
  toggle(index) {
    this.player[index] = !this.player[index];
    this.render();
  }
  check() {
    const match = this.target.every((v, i) => v === this.player[i]);
    const fb = document.getElementById('feedback');
    if (match) {
      this.score += 10 * this.level;
      this.level = Math.min(this.level + 1, 10);
      chrome.storage.local.set({ tileFlipScore: this.score, tileFlipLevel: this.level });
      fb.textContent = '✓ Perfect match!';
      fb.className = 'feedback correct';
      this.updateStats();
      setTimeout(() => this.newPuzzle(), 800);
    } else {
      fb.textContent = '✗ Not quite right!';
      fb.className = 'feedback wrong';
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new TileFlip());
