// Minesweeper - Popup Script
class Minesweeper {
  constructor() {
    this.size = 9;
    this.mineCount = 10;
    this.grid = [];
    this.revealed = [];
    this.flagged = [];
    this.gameOver = false;
    this.firstClick = true;
    this.init();
  }
  init() {
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
    this.revealed = Array(this.size).fill().map(() => Array(this.size).fill(false));
    this.flagged = Array(this.size).fill().map(() => Array(this.size).fill(false));
    this.gameOver = false;
    this.firstClick = true;
    document.getElementById('status').textContent = 'Click to start';
    document.getElementById('status').className = '';
    document.getElementById('mines').textContent = this.mineCount;
    this.render();
  }
  placeMines(firstR, firstC) {
    let placed = 0;
    while (placed < this.mineCount) {
      const r = Math.floor(Math.random() * this.size);
      const c = Math.floor(Math.random() * this.size);
      if (this.grid[r][c] !== -1 && !(Math.abs(r-firstR) <= 1 && Math.abs(c-firstC) <= 1)) {
        this.grid[r][c] = -1;
        placed++;
      }
    }
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] !== -1) {
          this.grid[r][c] = this.countAdjacentMines(r, c);
        }
      }
    }
  }
  countAdjacentMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.grid[nr][nc] === -1) count++;
      }
    }
    return count;
  }
  reveal(r, c) {
    if (this.gameOver || this.revealed[r][c] || this.flagged[r][c]) return;
    if (this.firstClick) {
      this.placeMines(r, c);
      this.firstClick = false;
      document.getElementById('status').textContent = 'Playing...';
    }
    this.revealed[r][c] = true;
    if (this.grid[r][c] === -1) {
      this.gameOver = true;
      document.getElementById('status').textContent = 'Game Over!';
      document.getElementById('status').className = 'lose';
      this.revealAll();
    } else if (this.grid[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) this.reveal(nr, nc);
        }
      }
    }
    if (this.checkWin()) {
      this.gameOver = true;
      document.getElementById('status').textContent = 'You Win!';
      document.getElementById('status').className = 'win';
    }
    this.render();
  }
  flag(r, c) {
    if (this.gameOver || this.revealed[r][c]) return;
    this.flagged[r][c] = !this.flagged[r][c];
    const flagCount = this.flagged.flat().filter(f => f).length;
    document.getElementById('mines').textContent = this.mineCount - flagCount;
    this.render();
  }
  checkWin() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] !== -1 && !this.revealed[r][c]) return false;
      }
    }
    return true;
  }
  revealAll() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === -1) this.revealed[r][c] = true;
      }
    }
    this.render();
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('button');
        cell.className = 'cell';
        if (this.revealed[r][c]) {
          cell.classList.add('revealed');
          if (this.grid[r][c] === -1) {
            cell.classList.add('mine');
            cell.textContent = '💣';
          } else if (this.grid[r][c] > 0) {
            cell.textContent = this.grid[r][c];
            cell.dataset.num = this.grid[r][c];
          }
        } else if (this.flagged[r][c]) {
          cell.classList.add('flagged');
        }
        cell.addEventListener('click', () => this.reveal(r, c));
        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); this.flag(r, c); });
        gridEl.appendChild(cell);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new Minesweeper());
