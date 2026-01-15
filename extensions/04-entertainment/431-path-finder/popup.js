// Path Finder - Popup Script
class PathFinder {
  constructor() {
    this.size = 7;
    this.grid = [];
    this.start = 0;
    this.end = 0;
    this.current = 0;
    this.visited = new Set();
    this.level = 1;
    this.solved = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['pathLevel', 'pathSolved'], (r) => {
      this.level = r.pathLevel || 1;
      this.solved = r.pathSolved || 0;
      this.generate();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.generate());
  }
  generate() {
    this.grid = [];
    for (let i = 0; i < this.size * this.size; i++) {
      this.grid.push(Math.random() < 0.3 ? 1 : 0);
    }
    this.start = 0;
    this.end = this.size * this.size - 1;
    this.grid[this.start] = 0;
    this.grid[this.end] = 0;
    this.ensurePath();
    this.current = this.start;
    this.visited = new Set([this.start]);
    this.render();
    this.updateStats();
  }
  ensurePath() {
    let x = 0, y = 0;
    while (x < this.size - 1 || y < this.size - 1) {
      this.grid[y * this.size + x] = 0;
      if (x < this.size - 1 && (y >= this.size - 1 || Math.random() < 0.5)) x++;
      else y++;
    }
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    this.grid.forEach((cell, idx) => {
      const div = document.createElement('div');
      div.className = 'cell';
      if (cell === 1) {
        div.classList.add('wall');
      } else if (idx === this.start) {
        div.classList.add('start');
        div.textContent = 'S';
      } else if (idx === this.end) {
        div.classList.add('end');
        div.textContent = 'E';
      } else if (idx === this.current) {
        div.classList.add('current');
      } else if (this.visited.has(idx)) {
        div.classList.add('visited');
      } else {
        div.classList.add('path');
      }
      div.addEventListener('click', () => this.move(idx));
      gridEl.appendChild(div);
    });
  }
  move(idx) {
    if (this.grid[idx] === 1) return;
    const cx = this.current % this.size;
    const cy = Math.floor(this.current / this.size);
    const nx = idx % this.size;
    const ny = Math.floor(idx / this.size);
    if (Math.abs(cx - nx) + Math.abs(cy - ny) !== 1) return;
    this.current = idx;
    this.visited.add(idx);
    this.render();
    if (idx === this.end) this.win();
  }
  win() {
    this.solved++;
    this.level++;
    chrome.storage.local.set({ pathLevel: this.level, pathSolved: this.solved });
    this.updateStats();
    setTimeout(() => { alert('You found the path!'); this.generate(); }, 100);
  }
  updateStats() {
    document.getElementById('level').textContent = this.level;
    document.getElementById('solved').textContent = this.solved;
  }
}
document.addEventListener('DOMContentLoaded', () => new PathFinder());
