// Tile Slide - Popup Script
class TileSlide {
  constructor() {
    this.tiles = [];
    this.emptyIdx = 15;
    this.moves = 0;
    this.best = null;
    this.solved = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['tileSlideBest'], (r) => {
      this.best = r.tileSlideBest || null;
      document.getElementById('best').textContent = this.best || '--';
    });
    document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffle());
    this.reset();
  }
  reset() {
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    this.emptyIdx = 15;
    this.moves = 0;
    this.solved = false;
    document.getElementById('moves').textContent = '0';
    document.getElementById('message').textContent = '';
    this.render();
  }
  shuffle() {
    this.reset();
    for (let i = 0; i < 100; i++) {
      const neighbors = this.getNeighbors(this.emptyIdx);
      const randIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.swap(randIdx, this.emptyIdx);
      this.emptyIdx = randIdx;
    }
    this.moves = 0;
    document.getElementById('moves').textContent = '0';
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
  swap(a, b) {
    [this.tiles[a], this.tiles[b]] = [this.tiles[b], this.tiles[a]];
  }
  move(idx) {
    if (this.solved) return;
    const neighbors = this.getNeighbors(idx);
    if (neighbors.includes(this.emptyIdx)) {
      this.swap(idx, this.emptyIdx);
      this.emptyIdx = idx;
      this.moves++;
      document.getElementById('moves').textContent = this.moves;
      this.render();
      this.checkWin();
    }
  }
  checkWin() {
    const solved = this.tiles.every((t, i) => i === 15 ? t === 0 : t === i + 1);
    if (solved) {
      this.solved = true;
      document.getElementById('message').textContent = '🎉 Solved in ' + this.moves + ' moves!';
      if (this.best === null || this.moves < this.best) {
        this.best = this.moves;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ tileSlideBest: this.best });
      }
    }
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = this.tiles.map((t, i) => {
      if (t === 0) {
        return `<button class="tile empty" data-idx="${i}"></button>`;
      }
      return `<button class="tile" data-idx="${i}">${t}</button>`;
    }).join('');
    grid.querySelectorAll('.tile:not(.empty)').forEach(tile => {
      tile.addEventListener('click', () => this.move(parseInt(tile.dataset.idx)));
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new TileSlide());
