// Binary Puzzle - Popup Script
class BinaryPuzzle {
  constructor() {
    this.size = 6;
    this.grid = [];
    this.fixed = [];
    this.level = 1;
    this.solved = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['binaryLevel', 'binarySolved'], (r) => {
      if (r.binaryLevel) this.level = r.binaryLevel;
      if (r.binarySolved) this.solved = r.binarySolved;
      this.updateStats();
    });
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    this.newPuzzle();
  }
  newPuzzle() {
    this.grid = [];
    this.fixed = [];
    for (let i = 0; i < this.size * this.size; i++) {
      this.grid.push(-1);
      this.fixed.push(false);
    }
    const hints = 12 + Math.floor(this.level / 2);
    let placed = 0;
    while (placed < hints) {
      const idx = Math.floor(Math.random() * this.size * this.size);
      if (!this.fixed[idx]) {
        this.grid[idx] = Math.floor(Math.random() * 2);
        this.fixed[idx] = true;
        placed++;
      }
    }
    document.getElementById('message').textContent = '';
    this.render();
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    this.grid.forEach((val, idx) => {
      const cell = document.createElement('button');
      cell.className = 'cell';
      if (this.fixed[idx]) cell.classList.add('fixed');
      if (val === 0) cell.classList.add('zero');
      if (val === 1) cell.classList.add('one');
      cell.textContent = val === -1 ? '' : val;
      if (!this.fixed[idx]) {
        cell.addEventListener('click', () => this.toggle(idx));
      }
      gridEl.appendChild(cell);
    });
  }
  toggle(idx) {
    if (this.grid[idx] === -1) this.grid[idx] = 0;
    else if (this.grid[idx] === 0) this.grid[idx] = 1;
    else this.grid[idx] = -1;
    this.render();
  }
  check() {
    if (this.grid.includes(-1)) {
      this.showMessage('Fill all cells!', false);
      return;
    }
    for (let r = 0; r < this.size; r++) {
      let zeros = 0, ones = 0;
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r * this.size + c] === 0) zeros++;
        else ones++;
      }
      if (zeros !== this.size / 2 || ones !== this.size / 2) {
        this.showMessage('Each row needs 3 of each!', false);
        return;
      }
    }
    for (let c = 0; c < this.size; c++) {
      let zeros = 0, ones = 0;
      for (let r = 0; r < this.size; r++) {
        if (this.grid[r * this.size + c] === 0) zeros++;
        else ones++;
      }
      if (zeros !== this.size / 2 || ones !== this.size / 2) {
        this.showMessage('Each column needs 3 of each!', false);
        return;
      }
    }
    this.solved++;
    this.level++;
    chrome.storage.local.set({ binaryLevel: this.level, binarySolved: this.solved });
    this.showMessage('Correct! Level up!', true);
    this.updateStats();
  }
  showMessage(msg, success) {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.className = 'message ' + (success ? 'success' : 'error');
  }
  updateStats() {
    document.getElementById('level').textContent = this.level;
    document.getElementById('solved').textContent = this.solved;
  }
}
document.addEventListener('DOMContentLoaded', () => new BinaryPuzzle());
