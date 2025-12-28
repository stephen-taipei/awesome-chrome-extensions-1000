// Connect Four - Popup Script
class ConnectFour {
  constructor() {
    this.rows = 6;
    this.cols = 7;
    this.board = [];
    this.currentPlayer = 'red';
    this.gameOver = false;
    this.init();
  }
  init() {
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(''));
    this.currentPlayer = 'red';
    this.gameOver = false;
    document.getElementById('status').textContent = 'Your turn (Red)';
    this.render();
  }
  render() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell' + (this.board[r][c] ? ' ' + this.board[r][c] : '');
        cell.dataset.col = c;
        cell.addEventListener('click', () => this.drop(c));
        boardEl.appendChild(cell);
      }
    }
  }
  drop(col) {
    if (this.gameOver) return;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (!this.board[r][col]) {
        this.board[r][col] = this.currentPlayer;
        this.render();
        if (this.checkWin(r, col)) {
          this.gameOver = true;
          document.getElementById('status').textContent = `${this.currentPlayer === 'red' ? 'Red' : 'Yellow'} wins!`;
          this.highlightWin(r, col);
          return;
        }
        if (this.board[0].every(c => c)) {
          this.gameOver = true;
          document.getElementById('status').textContent = "It's a draw!";
          return;
        }
        this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        document.getElementById('status').textContent = `${this.currentPlayer === 'red' ? 'Your' : 'CPU'} turn (${this.currentPlayer === 'red' ? 'Red' : 'Yellow'})`;
        if (this.currentPlayer === 'yellow') {
          setTimeout(() => this.cpuMove(), 500);
        }
        return;
      }
    }
  }
  cpuMove() {
    const available = [];
    for (let c = 0; c < this.cols; c++) {
      if (!this.board[0][c]) available.push(c);
    }
    if (available.length > 0) {
      this.drop(available[Math.floor(Math.random() * available.length)]);
    }
  }
  checkWin(row, col) {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i < 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === this.currentPlayer) count++;
        else break;
      }
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === this.currentPlayer) count++;
        else break;
      }
      if (count >= 4) return true;
    }
    return false;
  }
  highlightWin(row, col) {
    const cells = document.querySelectorAll('.cell');
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of directions) {
      const line = [{r: row, c: col}];
      for (let i = 1; i < 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === this.currentPlayer) line.push({r, c});
        else break;
      }
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === this.currentPlayer) line.push({r, c});
        else break;
      }
      if (line.length >= 4) {
        line.forEach(({r, c}) => cells[r * this.cols + c].classList.add('win'));
        return;
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new ConnectFour());
