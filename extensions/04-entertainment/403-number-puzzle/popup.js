// Number Puzzle - Popup Script
class NumberPuzzle {
  constructor() {
    this.tiles = [];
    this.emptyIdx = 15;
    this.moves = 0;
    this.best = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['puzzleBest'], (r) => {
      if (r.puzzleBest) {
        this.best = r.puzzleBest;
        document.getElementById('best').textContent = this.best;
      }
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.tiles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
    this.emptyIdx = 15;
    this.moves = 0;
    for (let i = 0; i < 200; i++) {
      const neighbors = this.getNeighbors(this.emptyIdx);
      const randNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.swap(this.emptyIdx, randNeighbor);
      this.emptyIdx = randNeighbor;
    }
    this.render();
    this.updateStats();
  }
  getNeighbors(idx) {
    const neighbors = [];
    const row = Math.floor(idx / 4), col = idx % 4;
    if (row > 0) neighbors.push(idx - 4);
    if (row < 3) neighbors.push(idx + 4);
    if (col > 0) neighbors.push(idx - 1);
    if (col < 3) neighbors.push(idx + 1);
    return neighbors;
  }
  swap(i, j) {
    [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    this.tiles.forEach((val, idx) => {
      const btn = document.createElement('button');
      btn.className = 'tile' + (val === 0 ? ' empty' : '');
      btn.textContent = val || '';
      if (val !== 0) btn.addEventListener('click', () => this.move(idx));
      grid.appendChild(btn);
    });
  }
  move(idx) {
    if (!this.getNeighbors(this.emptyIdx).includes(idx)) return;
    this.swap(idx, this.emptyIdx);
    this.emptyIdx = idx;
    this.moves++;
    this.render();
    this.updateStats();
    if (this.checkWin()) this.handleWin();
  }
  checkWin() {
    for (let i = 0; i < 15; i++) if (this.tiles[i] !== i + 1) return false;
    return this.tiles[15] === 0;
  }
  handleWin() {
    if (!this.best || this.moves < this.best) {
      this.best = this.moves;
      chrome.storage.local.set({ puzzleBest: this.best });
    }
    this.updateStats();
    setTimeout(() => alert(`You won in ${this.moves} moves!`), 100);
  }
  updateStats() {
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('best').textContent = this.best || '-';
  }
}
document.addEventListener('DOMContentLoaded', () => new NumberPuzzle());
