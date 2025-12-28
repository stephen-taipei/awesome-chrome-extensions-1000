// Checkers - Popup Script
class Checkers {
  constructor() {
    this.board = [];
    this.selected = null;
    this.turn = 'red';
    this.init();
  }
  init() {
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.board = Array(8).fill().map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) this.board[r][c] = { color: 'black', king: false };
      }
    }
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) this.board[r][c] = { color: 'red', king: false };
      }
    }
    this.selected = null;
    this.turn = 'red';
    document.getElementById('status').textContent = 'Your turn (Red)';
    this.render();
  }
  render() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
        if (this.selected && this.selected.r === r && this.selected.c === c) cell.classList.add('selected');
        cell.dataset.row = r;
        cell.dataset.col = c;
        if (this.board[r][c]) {
          const piece = document.createElement('div');
          piece.className = `piece ${this.board[r][c].color}` + (this.board[r][c].king ? ' king' : '');
          cell.appendChild(piece);
        }
        cell.addEventListener('click', () => this.handleClick(r, c));
        boardEl.appendChild(cell);
      }
    }
  }
  handleClick(r, c) {
    if (this.turn !== 'red') return;
    const piece = this.board[r][c];
    if (this.selected) {
      if (this.isValidMove(this.selected.r, this.selected.c, r, c)) {
        this.movePiece(this.selected.r, this.selected.c, r, c);
        this.selected = null;
        this.turn = 'black';
        document.getElementById('status').textContent = 'CPU thinking...';
        this.render();
        setTimeout(() => this.cpuMove(), 500);
        return;
      }
      this.selected = null;
    }
    if (piece && piece.color === 'red') {
      this.selected = { r, c };
    }
    this.render();
  }
  isValidMove(fromR, fromC, toR, toC) {
    if (this.board[toR][toC]) return false;
    if ((toR + toC) % 2 === 0) return false;
    const piece = this.board[fromR][fromC];
    const dir = piece.color === 'red' ? -1 : 1;
    const rowDiff = toR - fromR;
    const colDiff = Math.abs(toC - fromC);
    if (colDiff === 1 && (rowDiff === dir || (piece.king && Math.abs(rowDiff) === 1))) return true;
    if (colDiff === 2 && (rowDiff === dir * 2 || (piece.king && Math.abs(rowDiff) === 2))) {
      const midR = (fromR + toR) / 2;
      const midC = (fromC + toC) / 2;
      const midPiece = this.board[midR][midC];
      if (midPiece && midPiece.color !== piece.color) return true;
    }
    return false;
  }
  movePiece(fromR, fromC, toR, toC) {
    const piece = this.board[fromR][fromC];
    this.board[toR][toC] = piece;
    this.board[fromR][fromC] = null;
    if (Math.abs(toR - fromR) === 2) {
      const midR = (fromR + toR) / 2;
      const midC = (fromC + toC) / 2;
      this.board[midR][midC] = null;
    }
    if ((piece.color === 'red' && toR === 0) || (piece.color === 'black' && toR === 7)) {
      piece.king = true;
    }
  }
  cpuMove() {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.color === 'black') {
          for (let tr = 0; tr < 8; tr++) {
            for (let tc = 0; tc < 8; tc++) {
              if (this.isValidMoveFor(r, c, tr, tc, 'black')) {
                moves.push({ fr: r, fc: c, tr, tc, jump: Math.abs(tr - r) === 2 });
              }
            }
          }
        }
      }
    }
    const jumps = moves.filter(m => m.jump);
    const move = jumps.length > 0 ? jumps[Math.floor(Math.random() * jumps.length)] : moves[Math.floor(Math.random() * moves.length)];
    if (move) {
      this.movePiece(move.fr, move.fc, move.tr, move.tc);
    }
    this.turn = 'red';
    document.getElementById('status').textContent = 'Your turn (Red)';
    this.render();
  }
  isValidMoveFor(fromR, fromC, toR, toC, color) {
    const piece = this.board[fromR][fromC];
    if (!piece || piece.color !== color) return false;
    return this.isValidMove(fromR, fromC, toR, toC);
  }
}
document.addEventListener('DOMContentLoaded', () => new Checkers());
