// Lights Out - Popup Script
class LightsOut {
  constructor() {
    this.size = 5;
    this.grid = [];
    this.moves = 0;
    this.level = 1;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['lightsLevel']);
    this.level = data.lightsLevel || 1;
    document.getElementById('level').textContent = this.level;
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    document.getElementById('grid').addEventListener('click', (e) => this.toggle(e));
    this.newPuzzle();
  }
  newPuzzle() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
    this.moves = 0;
    document.getElementById('moves').textContent = 0;
    document.getElementById('message').textContent = '';
    const clicks = this.level + 2;
    for (let i = 0; i < clicks; i++) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);
      this.applyToggle(r, c);
    }
    if (!this.grid.flat().some(v => v)) {
      this.grid[2][2] = true;
      this.grid[1][2] = true;
      this.grid[3][2] = true;
    }
    this.render();
  }
  toggle(e) {
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    this.applyToggle(r, c);
    this.moves++;
    document.getElementById('moves').textContent = this.moves;
    this.render();
    if (this.checkWin()) {
      document.getElementById('message').textContent = `🎉 Solved in ${this.moves} moves!`;
      this.level++;
      chrome.storage.local.set({ lightsLevel: this.level });
      document.getElementById('level').textContent = this.level;
    }
  }
  applyToggle(r, c) {
    const toggle = (row, col) => {
      if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
        this.grid[row][col] = !this.grid[row][col];
      }
    };
    toggle(r, c);
    toggle(r - 1, c);
    toggle(r + 1, c);
    toggle(r, c - 1);
    toggle(r, c + 1);
  }
  checkWin() {
    return !this.grid.flat().some(v => v);
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('button');
        cell.className = 'cell ' + (this.grid[r][c] ? 'on' : 'off');
        cell.dataset.row = r;
        cell.dataset.col = c;
        gridEl.appendChild(cell);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new LightsOut());
