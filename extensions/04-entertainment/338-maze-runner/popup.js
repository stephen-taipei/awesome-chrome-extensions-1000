// Maze Runner - Popup Script
class MazeRunner {
  constructor() {
    this.size = 9;
    this.maze = [];
    this.player = { r: 1, c: 1 };
    this.exit = { r: 7, c: 7 };
    this.moves = 0;
    this.init();
  }
  init() {
    document.getElementById('newBtn').addEventListener('click', () => this.newMaze());
    document.querySelectorAll('.arrow').forEach(btn => {
      btn.addEventListener('click', () => this.move(btn.dataset.dir));
    });
    document.addEventListener('keydown', (e) => {
      const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (dirs[e.key]) this.move(dirs[e.key]);
    });
    this.newMaze();
  }
  newMaze() {
    this.maze = Array(this.size).fill(null).map(() => Array(this.size).fill(1));
    this.player = { r: 1, c: 1 };
    this.moves = 0;
    this.generate(1, 1);
    this.maze[1][1] = 0;
    this.maze[7][7] = 0;
    this.render();
  }
  generate(r, c) {
    this.maze[r][c] = 0;
    const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < this.size - 1 && nc > 0 && nc < this.size - 1 && this.maze[nr][nc] === 1) {
        this.maze[r + dr / 2][c + dc / 2] = 0;
        this.generate(nr, nc);
      }
    }
  }
  move(dir) {
    const dirs = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [dr, dc] = dirs[dir];
    const nr = this.player.r + dr, nc = this.player.c + dc;
    if (this.maze[nr] && this.maze[nr][nc] === 0) {
      this.player = { r: nr, c: nc };
      this.moves++;
      this.render();
      if (nr === this.exit.r && nc === this.exit.c) {
        setTimeout(() => alert(`You escaped in ${this.moves} moves!`), 100);
      }
    }
  }
  render() {
    document.getElementById('moves').textContent = this.moves;
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        let cls = 'cell';
        if (r === this.player.r && c === this.player.c) cls += ' player';
        else if (r === this.exit.r && c === this.exit.c) cls += ' exit';
        else if (this.maze[r][c] === 1) cls += ' wall';
        else cls += ' path';
        cell.className = cls;
        grid.appendChild(cell);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new MazeRunner());
