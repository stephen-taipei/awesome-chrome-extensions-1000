// 2048 - Popup Script
class Game2048 {
  constructor() {
    this.grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    this.score = 0;
    this.best = 0;
    this.init();
  }
  init() {
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    document.querySelectorAll('.ctrl').forEach(btn => {
      btn.addEventListener('click', () => this.move(btn.dataset.dir));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') this.move('up');
      if (e.key === 'ArrowDown') this.move('down');
      if (e.key === 'ArrowLeft') this.move('left');
      if (e.key === 'ArrowRight') this.move('right');
    });
    this.loadBest();
    this.newGame();
  }
  newGame() {
    this.grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    this.score = 0;
    this.addTile();
    this.addTile();
    this.render();
  }
  addTile() {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) empty.push({r, c});
      }
    }
    if (empty.length > 0) {
      const {r, c} = empty[Math.floor(Math.random() * empty.length)];
      this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }
  move(dir) {
    const oldGrid = JSON.stringify(this.grid);
    if (dir === 'left') this.grid = this.grid.map(row => this.slideRow(row));
    if (dir === 'right') this.grid = this.grid.map(row => this.slideRow(row.reverse()).reverse());
    if (dir === 'up') {
      this.grid = this.transpose(this.grid);
      this.grid = this.grid.map(row => this.slideRow(row));
      this.grid = this.transpose(this.grid);
    }
    if (dir === 'down') {
      this.grid = this.transpose(this.grid);
      this.grid = this.grid.map(row => this.slideRow(row.reverse()).reverse());
      this.grid = this.transpose(this.grid);
    }
    if (JSON.stringify(this.grid) !== oldGrid) {
      this.addTile();
    }
    if (this.score > this.best) {
      this.best = this.score;
      this.saveBest();
    }
    this.render();
  }
  slideRow(row) {
    let arr = row.filter(x => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        this.score += arr[i];
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  }
  transpose(grid) {
    return grid[0].map((_, i) => grid.map(row => row[i]));
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const val = this.grid[r][c];
        if (val > 0) {
          tile.textContent = val;
          tile.dataset.val = val;
        }
        gridEl.appendChild(tile);
      }
    }
    document.getElementById('score').textContent = this.score;
    document.getElementById('best').textContent = this.best;
  }
  saveBest() { chrome.storage.local.set({ best2048: this.best }); }
  loadBest() {
    chrome.storage.local.get(['best2048'], (r) => {
      this.best = r.best2048 || 0;
      document.getElementById('best').textContent = this.best;
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new Game2048());
