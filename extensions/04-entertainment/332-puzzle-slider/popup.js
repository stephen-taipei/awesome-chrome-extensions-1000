// Puzzle Slider - Popup Script
class PuzzleSlider {
  constructor() {
    this.tiles = [];
    this.moves = 0;
    this.solved = false;
    this.init();
  }
  init() {
    document.getElementById('shuffle').addEventListener('click', () => this.shuffle());
    this.shuffle();
  }
  shuffle() {
    this.tiles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
    for (let i = 0; i < 100; i++) {
      const emptyIdx = this.tiles.indexOf(0);
      const neighbors = this.getNeighbors(emptyIdx);
      const swap = neighbors[Math.floor(Math.random() * neighbors.length)];
      [this.tiles[emptyIdx], this.tiles[swap]] = [this.tiles[swap], this.tiles[emptyIdx]];
    }
    this.moves = 0;
    this.solved = false;
    this.render();
  }
  getNeighbors(idx) {
    const neighbors = [];
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    if (row > 0) neighbors.push(idx - 4);
    if (row < 3) neighbors.push(idx + 4);
    if (col > 0) neighbors.push(idx - 1);
    if (col < 3) neighbors.push(idx + 1);
    return neighbors;
  }
  render() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    this.tiles.forEach((tile, idx) => {
      const el = document.createElement('button');
      el.className = 'tile' + (tile === 0 ? ' empty' : '');
      el.textContent = tile || '';
      el.addEventListener('click', () => this.move(idx));
      board.appendChild(el);
    });
    document.getElementById('moves').textContent = this.moves;
    const existingWin = document.querySelector('.win');
    if (existingWin) existingWin.remove();
    if (this.solved) {
      const win = document.createElement('div');
      win.className = 'win';
      win.textContent = `Solved in ${this.moves} moves!`;
      board.before(win);
    }
  }
  move(idx) {
    if (this.solved) return;
    const emptyIdx = this.tiles.indexOf(0);
    const neighbors = this.getNeighbors(emptyIdx);
    if (neighbors.includes(idx)) {
      [this.tiles[emptyIdx], this.tiles[idx]] = [this.tiles[idx], this.tiles[emptyIdx]];
      this.moves++;
      this.checkWin();
      this.render();
    }
  }
  checkWin() {
    const solved = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
    if (this.tiles.every((t, i) => t === solved[i])) {
      this.solved = true;
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new PuzzleSlider());
