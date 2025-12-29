// Hex Match - Popup Script
class HexMatch {
  constructor() {
    this.cols = 6;
    this.rows = 6;
    this.colors = 6;
    this.grid = [];
    this.selected = null;
    this.score = 0;
    this.best = 0;
    this.moves = 20;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['hexBest']);
    this.best = data.hexBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    document.getElementById('grid').addEventListener('click', (e) => this.handleClick(e));
    this.newGame();
  }
  newGame() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = Math.floor(Math.random() * this.colors);
      }
    }
    this.selected = null;
    this.score = 0;
    this.moves = 20;
    document.getElementById('score').textContent = 0;
    document.getElementById('moves').textContent = 20;
    this.render();
  }
  handleClick(e) {
    const hex = e.target;
    if (!hex.classList.contains('hex')) return;
    if (this.moves <= 0) return;
    const r = parseInt(hex.dataset.row);
    const c = parseInt(hex.dataset.col);
    if (this.selected) {
      const { row: sr, col: sc } = this.selected;
      const adjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;
      if (adjacent) {
        [this.grid[sr][sc], this.grid[r][c]] = [this.grid[r][c], this.grid[sr][sc]];
        this.moves--;
        document.getElementById('moves').textContent = this.moves;
        this.checkMatches();
      }
      this.selected = null;
    } else {
      this.selected = { row: r, col: c };
    }
    this.render();
  }
  checkMatches() {
    let matched = false;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 2; c++) {
        if (this.grid[r][c] === this.grid[r][c + 1] && this.grid[r][c] === this.grid[r][c + 2]) {
          this.grid[r][c] = this.grid[r][c + 1] = this.grid[r][c + 2] = -1;
          matched = true;
        }
      }
    }
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 2; r++) {
        if (this.grid[r][c] >= 0 && this.grid[r][c] === this.grid[r + 1][c] && this.grid[r][c] === this.grid[r + 2][c]) {
          this.grid[r][c] = this.grid[r + 1][c] = this.grid[r + 2][c] = -1;
          matched = true;
        }
      }
    }
    if (matched) {
      let count = 0;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c] === -1) count++;
        }
      }
      this.score += count * 10;
      document.getElementById('score').textContent = this.score;
      if (this.score > this.best) {
        this.best = this.score;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ hexBest: this.best });
      }
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c] === -1) {
            this.grid[r][c] = Math.floor(Math.random() * this.colors);
          }
        }
      }
    }
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const hex = document.createElement('div');
        hex.className = 'hex c' + this.grid[r][c];
        if (this.selected && this.selected.row === r && this.selected.col === c) {
          hex.classList.add('selected');
        }
        hex.dataset.row = r;
        hex.dataset.col = c;
        gridEl.appendChild(hex);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new HexMatch());
