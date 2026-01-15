// Color Flood - Popup Script
class ColorFlood {
  constructor() {
    this.colors = ['#ef4444','#22c55e','#3b82f6','#eab308','#a855f7','#ec4899'];
    this.grid = [];
    this.size = 10;
    this.moves = 0;
    this.maxMoves = 25;
    this.wins = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['floodWins'], (r) => {
      if (r.floodWins) this.wins = r.floodWins;
      this.updateStats();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.grid = [];
    for (let i = 0; i < this.size * this.size; i++) {
      this.grid.push(Math.floor(Math.random() * this.colors.length));
    }
    this.moves = 0;
    document.getElementById('message').textContent = '';
    this.render();
    this.renderColors();
    this.updateStats();
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    this.grid.forEach(c => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.background = this.colors[c];
      gridEl.appendChild(cell);
    });
  }
  renderColors() {
    const colorsEl = document.getElementById('colors');
    colorsEl.innerHTML = '';
    this.colors.forEach((color, idx) => {
      const btn = document.createElement('button');
      btn.className = 'color-btn';
      btn.style.background = color;
      btn.addEventListener('click', () => this.flood(idx));
      colorsEl.appendChild(btn);
    });
  }
  flood(newColor) {
    const oldColor = this.grid[0];
    if (oldColor === newColor) return;
    this.moves++;
    this.fill(0, 0, oldColor, newColor);
    this.render();
    this.updateStats();
    if (this.checkWin()) {
      this.wins++;
      chrome.storage.local.set({ floodWins: this.wins });
      document.getElementById('message').textContent = `You won in ${this.moves} moves!`;
      document.getElementById('message').className = 'message success';
      this.updateStats();
    } else if (this.moves >= this.maxMoves) {
      document.getElementById('message').textContent = 'Out of moves!';
      document.getElementById('message').className = 'message error';
    }
  }
  fill(x, y, oldColor, newColor) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
    const idx = y * this.size + x;
    if (this.grid[idx] !== oldColor) return;
    this.grid[idx] = newColor;
    this.fill(x + 1, y, oldColor, newColor);
    this.fill(x - 1, y, oldColor, newColor);
    this.fill(x, y + 1, oldColor, newColor);
    this.fill(x, y - 1, oldColor, newColor);
  }
  checkWin() {
    const first = this.grid[0];
    return this.grid.every(c => c === first);
  }
  updateStats() {
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('wins').textContent = this.wins;
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorFlood());
