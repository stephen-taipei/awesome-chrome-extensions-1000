// Sudoku - Popup Script
class Sudoku {
  constructor() {
    this.puzzle = [];
    this.solution = [];
    this.selected = null;
    this.init();
  }
  init() {
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    document.querySelectorAll('.num').forEach(btn => {
      btn.addEventListener('click', () => this.enterNumber(parseInt(btn.dataset.num)));
    });
    this.newGame();
  }
  newGame() {
    this.generatePuzzle();
    this.render();
  }
  generatePuzzle() {
    const base = [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]];
    this.solution = base.map(r => [...r]);
    for (let i = 0; i < 20; i++) {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      if (a !== b) {
        this.solution = this.solution.map(row => row.map(c => c === a ? b : c === b ? a : c));
      }
    }
    this.puzzle = this.solution.map(r => [...r]);
    let removed = 0;
    while (removed < 45) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (this.puzzle[r][c] !== 0) {
        this.puzzle[r][c] = 0;
        removed++;
      }
    }
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('button');
        cell.className = 'cell' + (this.solution[r][c] === this.puzzle[r][c] && this.puzzle[r][c] !== 0 ? ' fixed' : '');
        cell.textContent = this.puzzle[r][c] || '';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => this.selectCell(r, c));
        grid.appendChild(cell);
      }
    }
  }
  selectCell(r, c) {
    if (this.solution[r][c] === this.puzzle[r][c] && this.puzzle[r][c] !== 0) return;
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected'));
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    cell.classList.add('selected');
    this.selected = { r, c };
  }
  enterNumber(num) {
    if (!this.selected) return;
    const { r, c } = this.selected;
    this.puzzle[r][c] = num;
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    cell.textContent = num || '';
    cell.classList.remove('error');
    if (num !== 0 && num !== this.solution[r][c]) {
      cell.classList.add('error');
    }
    if (this.checkWin()) {
      setTimeout(() => alert('Congratulations! You solved it!'), 100);
    }
  }
  checkWin() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.puzzle[r][c] !== this.solution[r][c]) return false;
      }
    }
    return true;
  }
}
document.addEventListener('DOMContentLoaded', () => new Sudoku());
