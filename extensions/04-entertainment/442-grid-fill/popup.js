// Grid Fill - Popup Script
class GridFill {
  constructor() {
    this.size = 5;
    this.grid = [];
    this.current = { x: 0, y: 0 };
    this.filled = 1;
    this.score = 0;
    this.moves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    this.init();
  }
  init() {
    chrome.storage.local.get(['gridFillScore'], (r) => {
      this.score = r.gridFillScore || 0;
      document.getElementById('score').textContent = this.score;
    });
    document.getElementById('resetBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.current = { x: Math.floor(Math.random() * this.size), y: Math.floor(Math.random() * this.size) };
    this.grid[this.current.y][this.current.x] = 1;
    this.filled = 1;
    document.getElementById('filled').textContent = '1';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    this.render();
  }
  getValidMoves() {
    const valid = [];
    for (const [dx, dy] of this.moves) {
      const nx = this.current.x + dx;
      const ny = this.current.y + dy;
      if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.grid[ny][nx] === 0) {
        valid.push({ x: nx, y: ny });
      }
    }
    return valid;
  }
  render() {
    const validMoves = this.getValidMoves();
    const el = document.getElementById('grid');
    el.innerHTML = '';
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const isCurrent = x === this.current.x && y === this.current.y;
        const isFilled = this.grid[y][x] > 0;
        const isValid = validMoves.some(m => m.x === x && m.y === y);
        if (isCurrent) {
          cell.classList.add('current');
          cell.textContent = '♞';
        } else if (isFilled) {
          cell.classList.add('filled');
          cell.textContent = this.grid[y][x];
        } else if (isValid) {
          cell.classList.add('valid');
          cell.addEventListener('click', () => this.move(x, y));
        }
        el.appendChild(cell);
      }
    }
    if (validMoves.length === 0 && this.filled < 25) {
      document.getElementById('feedback').textContent = '😵 Stuck! Reset to try again.';
      document.getElementById('feedback').className = 'feedback stuck';
    }
  }
  move(x, y) {
    this.filled++;
    this.grid[y][x] = this.filled;
    this.current = { x, y };
    document.getElementById('filled').textContent = this.filled;
    this.render();
    if (this.filled === 25) {
      this.score += 100;
      chrome.storage.local.set({ gridFillScore: this.score });
      document.getElementById('score').textContent = this.score;
      document.getElementById('feedback').textContent = '🎉 Perfect! Grid completed!';
      document.getElementById('feedback').className = 'feedback win';
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new GridFill());
