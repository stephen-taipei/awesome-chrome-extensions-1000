// Pipe Connect - Popup Script
class PipeConnect {
  constructor() {
    this.size = 5;
    this.pipes = ['┃', '━', '┏', '┓', '┗', '┛', '┣', '┫', '┳', '┻', '╋'];
    this.grid = [];
    this.rotations = [];
    this.level = 1;
    this.moves = 0;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['pipeLevel']);
    this.level = data.pipeLevel || 1;
    document.getElementById('level').textContent = this.level;
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    document.getElementById('grid').addEventListener('click', (e) => this.rotate(e));
    this.newPuzzle();
  }
  newPuzzle() {
    this.grid = [];
    this.rotations = [];
    this.moves = 0;
    document.getElementById('moves').textContent = 0;
    document.getElementById('message').textContent = '';
    const simplePipes = ['┃', '━', '┏', '┓', '┗', '┛'];
    for (let r = 0; r < this.size; r++) {
      this.grid[r] = [];
      this.rotations[r] = [];
      for (let c = 0; c < this.size; c++) {
        this.grid[r][c] = simplePipes[Math.floor(Math.random() * simplePipes.length)];
        this.rotations[r][c] = Math.floor(Math.random() * 4);
      }
    }
    this.render();
  }
  rotate(e) {
    const pipe = e.target;
    if (!pipe.classList.contains('pipe')) return;
    const r = parseInt(pipe.dataset.row);
    const c = parseInt(pipe.dataset.col);
    this.rotations[r][c] = (this.rotations[r][c] + 1) % 4;
    this.moves++;
    document.getElementById('moves').textContent = this.moves;
    this.render();
    if (this.checkWin()) {
      document.getElementById('message').textContent = `🎉 Connected in ${this.moves} moves!`;
      this.level++;
      chrome.storage.local.set({ pipeLevel: this.level });
      document.getElementById('level').textContent = this.level;
    }
  }
  checkWin() {
    let aligned = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.rotations[r][c] === 0) aligned++;
      }
    }
    return aligned >= this.size * this.size * 0.8;
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const pipe = document.createElement('div');
        const rot = this.rotations[r][c] * 90;
        pipe.className = 'pipe' + (this.rotations[r][c] === 0 ? ' connected' : '');
        if (r === 0 && c === 0) pipe.classList.add('start');
        if (r === this.size - 1 && c === this.size - 1) pipe.classList.add('end');
        pipe.dataset.row = r;
        pipe.dataset.col = c;
        pipe.textContent = this.grid[r][c];
        pipe.style.transform = `rotate(${rot}deg)`;
        gridEl.appendChild(pipe);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new PipeConnect());
