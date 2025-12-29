// Emoji Slider - Popup Script
class EmojiSlider {
  constructor() {
    this.emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒'];
    this.solution = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒', ''];
    this.tiles = [];
    this.emptyIdx = 8;
    this.moves = 0;
    this.best = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['emojiSliderBest'], (r) => {
      if (r.emojiSliderBest) {
        this.best = r.emojiSliderBest;
        document.getElementById('best').textContent = this.best;
      }
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.tiles = [...this.solution];
    this.emptyIdx = 8;
    this.moves = 0;
    for (let i = 0; i < 100; i++) {
      const neighbors = this.getNeighbors(this.emptyIdx);
      const rand = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.swap(this.emptyIdx, rand);
      this.emptyIdx = rand;
    }
    this.render();
    this.updateStats();
  }
  getNeighbors(idx) {
    const neighbors = [];
    const row = Math.floor(idx / 3), col = idx % 3;
    if (row > 0) neighbors.push(idx - 3);
    if (row < 2) neighbors.push(idx + 3);
    if (col > 0) neighbors.push(idx - 1);
    if (col < 2) neighbors.push(idx + 1);
    return neighbors;
  }
  swap(i, j) {
    [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    this.tiles.forEach((emoji, idx) => {
      const tile = document.createElement('button');
      tile.className = 'tile' + (emoji === '' ? ' empty' : '');
      tile.textContent = emoji;
      if (emoji !== '') tile.addEventListener('click', () => this.move(idx));
      grid.appendChild(tile);
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
    for (let i = 0; i < 9; i++) {
      if (this.tiles[i] !== this.solution[i]) return false;
    }
    return true;
  }
  handleWin() {
    if (!this.best || this.moves < this.best) {
      this.best = this.moves;
      chrome.storage.local.set({ emojiSliderBest: this.best });
    }
    this.updateStats();
    setTimeout(() => alert(`Solved in ${this.moves} moves!`), 100);
  }
  updateStats() {
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('best').textContent = this.best || '-';
  }
}
document.addEventListener('DOMContentLoaded', () => new EmojiSlider());
