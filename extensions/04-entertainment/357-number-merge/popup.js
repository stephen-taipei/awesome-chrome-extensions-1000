// Number Merge - Popup Script
class NumberMerge {
  constructor() {
    this.size = 5;
    this.grid = [];
    this.selected = null;
    this.score = 0;
    this.best = 0;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['mergeBest']);
    this.best = data.mergeBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    document.getElementById('grid').addEventListener('click', (e) => this.handleClick(e));
    this.newGame();
  }
  newGame() {
    this.grid = [];
    for (let i = 0; i < this.size; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.grid[i][j] = Math.floor(Math.random() * 3) + 1;
      }
    }
    this.selected = null;
    this.score = 0;
    document.getElementById('score').textContent = 0;
    document.getElementById('message').textContent = '';
    this.render();
  }
  handleClick(e) {
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    if (this.selected) {
      const { row: sr, col: sc } = this.selected;
      const adjacent = (Math.abs(sr - r) === 1 && sc === c) || (Math.abs(sc - c) === 1 && sr === r);
      if (adjacent && this.grid[sr][sc] === this.grid[r][c]) {
        this.merge(sr, sc, r, c);
      }
      this.selected = null;
    } else {
      this.selected = { row: r, col: c };
    }
    this.render();
  }
  merge(r1, c1, r2, c2) {
    const val = this.grid[r1][c1];
    this.grid[r2][c2] = Math.min(val + 1, 9);
    this.grid[r1][c1] = Math.floor(Math.random() * 3) + 1;
    this.score += val * 10;
    document.getElementById('score').textContent = this.score;
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ mergeBest: this.best });
    }
    if (this.grid[r2][c2] === 9) {
      document.getElementById('message').textContent = '🎉 You reached 9!';
    }
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        const cell = document.createElement('button');
        cell.className = `cell n${val}`;
        if (this.selected && this.selected.row === r && this.selected.col === c) {
          cell.classList.add('selected');
        }
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.textContent = val;
        gridEl.appendChild(cell);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new NumberMerge());
