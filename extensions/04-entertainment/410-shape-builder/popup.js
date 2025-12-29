// Shape Builder - Popup Script
class ShapeBuilder {
  constructor() {
    this.patterns = [
      [[1,1,0,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
      [[1,1,1,0],[0,1,0,0],[0,0,0,0],[0,0,0,0]],
      [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
      [[1,0,0,0],[1,1,0,0],[0,1,0,0],[0,0,0,0]],
      [[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
      [[1,1,0,0],[1,0,0,0],[1,0,0,0],[0,0,0,0]],
      [[1,1,1,0],[1,0,0,0],[1,0,0,0],[0,0,0,0]],
      [[1,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]
    ];
    this.grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    this.target = [];
    this.level = 1;
    this.score = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['shapeScore','shapeLevel'], (r) => {
      if (r.shapeScore) this.score = r.shapeScore;
      if (r.shapeLevel) this.level = r.shapeLevel;
      this.updateStats();
    });
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
    this.newRound();
  }
  newRound() {
    this.target = this.patterns[Math.floor(Math.random() * this.patterns.length)];
    this.grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    this.renderTarget();
    this.renderCanvas();
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
  }
  renderTarget() {
    const container = document.getElementById('target');
    container.innerHTML = '';
    this.target.forEach(row => {
      row.forEach(cell => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.style.background = cell ? '#f59e0b' : '#2d3748';
        container.appendChild(div);
      });
    });
  }
  renderCanvas() {
    const container = document.getElementById('canvas');
    container.innerHTML = '';
    this.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        const div = document.createElement('div');
        div.className = 'cell' + (cell ? ' filled' : '');
        div.addEventListener('click', () => this.toggle(r, c));
        container.appendChild(div);
      });
    });
  }
  toggle(r, c) {
    this.grid[r][c] = this.grid[r][c] ? 0 : 1;
    this.renderCanvas();
  }
  clear() {
    this.grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    this.renderCanvas();
  }
  check() {
    let match = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] !== this.target[r][c]) match = false;
      }
    }
    if (match) {
      this.score += this.level * 10;
      this.level++;
      chrome.storage.local.set({ shapeScore: this.score, shapeLevel: this.level });
      document.getElementById('message').textContent = `Correct! +${(this.level-1) * 10}`;
      document.getElementById('message').className = 'message success';
      this.updateStats();
      setTimeout(() => this.newRound(), 1000);
    } else {
      document.getElementById('message').textContent = 'Not quite right!';
      document.getElementById('message').className = 'message error';
    }
  }
  updateStats() {
    document.getElementById('level').textContent = this.level;
    document.getElementById('score').textContent = this.score;
  }
}
document.addEventListener('DOMContentLoaded', () => new ShapeBuilder());
