// Color Flood - Popup Script
class ColorFlood {
  constructor() {
    this.colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    this.size = 12;
    this.board = [];
    this.moves = 0;
    this.maxMoves = 25;
    this.wins = 0;
    this.gameOver = false;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['floodWins']);
    this.wins = data.floodWins || 0;
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.renderColors();
    this.newGame();
  }
  newGame() {
    this.board = [];
    for (let i = 0; i < this.size; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.board[i][j] = Math.floor(Math.random() * this.colors.length);
      }
    }
    this.moves = 0;
    this.gameOver = false;
    document.getElementById('moves').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    this.render();
    this.updateActiveColor();
  }
  renderColors() {
    const container = document.getElementById('colors');
    container.innerHTML = this.colors.map((c, i) => `<button class="color-btn" data-color="${i}" style="background:${c}"></button>`).join('');
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-btn')) {
        this.flood(parseInt(e.target.dataset.color));
      }
    });
  }
  updateActiveColor() {
    const current = this.board[0][0];
    document.querySelectorAll('.color-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === current);
    });
  }
  flood(newColor) {
    if (this.gameOver) return;
    const oldColor = this.board[0][0];
    if (newColor === oldColor) return;
    this.moves++;
    document.getElementById('moves').textContent = this.moves;
    this.fill(0, 0, oldColor, newColor);
    this.render();
    this.updateActiveColor();
    if (this.checkWin()) {
      this.gameOver = true;
      this.wins++;
      chrome.storage.local.set({ floodWins: this.wins });
      document.getElementById('wins').textContent = this.wins;
      document.getElementById('message').textContent = `🎉 You won in ${this.moves} moves!`;
      document.getElementById('message').className = 'message win';
    } else if (this.moves >= this.maxMoves) {
      this.gameOver = true;
      document.getElementById('message').textContent = 'Game Over! Try again.';
      document.getElementById('message').className = 'message lose';
    }
  }
  fill(r, c, oldColor, newColor) {
    if (r < 0 || r >= this.size || c < 0 || c >= this.size) return;
    if (this.board[r][c] !== oldColor) return;
    this.board[r][c] = newColor;
    this.fill(r - 1, c, oldColor, newColor);
    this.fill(r + 1, c, oldColor, newColor);
    this.fill(r, c - 1, oldColor, newColor);
    this.fill(r, c + 1, oldColor, newColor);
  }
  checkWin() {
    const color = this.board[0][0];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] !== color) return false;
      }
    }
    return true;
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = this.board.flat().map(c => `<div class="cell" style="background:${this.colors[c]}"></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorFlood());
