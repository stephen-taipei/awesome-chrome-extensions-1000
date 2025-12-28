// Tic Tac Toe - Popup Script
class TicTacToe {
  constructor() {
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.scores = { X: 0, O: 0, draw: 0 };
    this.winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    this.init();
  }
  init() {
    this.loadScores();
    this.renderBoard();
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
  }
  renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = this.board.map((cell, i) => `<button class="cell ${cell.toLowerCase()}" data-index="${i}">${cell}</button>`).join('');
    boardEl.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('click', () => this.makeMove(parseInt(cell.dataset.index)));
    });
  }
  makeMove(index) {
    if (this.board[index] || this.gameOver) return;
    this.board[index] = this.currentPlayer;
    this.renderBoard();
    const winner = this.checkWinner();
    if (winner) {
      this.gameOver = true;
      this.highlightWin(winner.pattern);
      document.getElementById('status').textContent = `${winner.player} wins!`;
      this.scores[winner.player]++;
      this.updateScores();
    } else if (!this.board.includes('')) {
      this.gameOver = true;
      document.getElementById('status').textContent = "It's a draw!";
      this.scores.draw++;
      this.updateScores();
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      document.getElementById('status').textContent = `${this.currentPlayer === 'X' ? 'Your' : 'CPU'} turn (${this.currentPlayer})`;
      if (this.currentPlayer === 'O') setTimeout(() => this.cpuMove(), 300);
    }
  }
  cpuMove() {
    const empty = this.board.map((c, i) => c === '' ? i : null).filter(i => i !== null);
    if (empty.length > 0) this.makeMove(empty[Math.floor(Math.random() * empty.length)]);
  }
  checkWinner() {
    for (const pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return { player: this.board[a], pattern };
      }
    }
    return null;
  }
  highlightWin(pattern) {
    pattern.forEach(i => document.querySelector(`[data-index="${i}"]`).classList.add('win'));
  }
  updateScores() {
    document.getElementById('xScore').textContent = this.scores.X;
    document.getElementById('oScore').textContent = this.scores.O;
    document.getElementById('drawScore').textContent = this.scores.draw;
    this.saveScores();
  }
  reset() {
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.gameOver = false;
    document.getElementById('status').textContent = 'Your turn (X)';
    this.renderBoard();
  }
  saveScores() { chrome.storage.local.set({ tttScores: this.scores }); }
  loadScores() {
    chrome.storage.local.get(['tttScores'], (r) => {
      if (r.tttScores) { this.scores = r.tttScores; this.updateScores(); }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new TicTacToe());
