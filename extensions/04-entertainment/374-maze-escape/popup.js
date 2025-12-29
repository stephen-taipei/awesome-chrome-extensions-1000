// Maze Escape - Popup Script
class MazeEscape {
  constructor() {
    this.size = 11;
    this.maze = [];
    this.playerX = 1;
    this.playerY = 1;
    this.exitX = 9;
    this.exitY = 9;
    this.moves = 0;
    this.level = 1;
    this.init();
  }
  init() {
    chrome.storage.local.get(['mazeLevel'], (r) => {
      this.level = r.mazeLevel || 1;
      document.getElementById('level').textContent = this.level;
      this.generate();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.generate());
    document.addEventListener('keydown', (e) => this.move(e));
  }
  generate() {
    this.maze = Array(this.size).fill(null).map(() => Array(this.size).fill(1));
    this.carve(1, 1);
    this.playerX = 1;
    this.playerY = 1;
    this.exitX = this.size - 2;
    this.exitY = this.size - 2;
    this.maze[this.exitY][this.exitX] = 0;
    this.moves = 0;
    document.getElementById('moves').textContent = '0';
    document.getElementById('message').textContent = '';
    this.render();
  }
  carve(x, y) {
    this.maze[y][x] = 0;
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < this.size - 1 && ny > 0 && ny < this.size - 1 && this.maze[ny][nx] === 1) {
        this.maze[y + dy / 2][x + dx / 2] = 0;
        this.carve(nx, ny);
      }
    }
  }
  move(e) {
    const dirs = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const dir = dirs[e.key];
    if (!dir) return;
    e.preventDefault();
    const nx = this.playerX + dir[0];
    const ny = this.playerY + dir[1];
    if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && this.maze[ny][nx] === 0) {
      this.playerX = nx;
      this.playerY = ny;
      this.moves++;
      document.getElementById('moves').textContent = this.moves;
      this.render();
      if (nx === this.exitX && ny === this.exitY) {
        this.win();
      }
    }
  }
  win() {
    document.getElementById('message').textContent = '🎉 Escaped in ' + this.moves + ' moves!';
    this.level++;
    document.getElementById('level').textContent = this.level;
    chrome.storage.local.set({ mazeLevel: this.level });
    setTimeout(() => this.generate(), 1500);
  }
  render() {
    const el = document.getElementById('maze');
    el.style.gridTemplateColumns = `repeat(${this.size}, 20px)`;
    el.innerHTML = this.maze.map((row, y) => row.map((cell, x) => {
      let cls = 'cell';
      if (cell === 1) cls += ' wall';
      if (x === this.playerX && y === this.playerY) cls += ' player';
      else if (x === this.exitX && y === this.exitY) cls += ' exit';
      return `<div class="${cls}"></div>`;
    }).join('')).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new MazeEscape());
