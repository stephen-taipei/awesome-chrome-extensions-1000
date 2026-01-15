// Arrow Maze - Popup Script
class ArrowMaze {
  constructor() {
    this.size = 5;
    this.arrows = ['↑', '↓', '←', '→'];
    this.grid = [];
    this.player = { x: 0, y: 0 };
    this.goal = { x: 4, y: 4 };
    this.score = 0;
    this.level = 1;
    this.init();
  }
  init() {
    chrome.storage.local.get(['arrowMazeScore', 'arrowMazeLevel'], (r) => {
      this.score = r.arrowMazeScore || 0;
      this.level = r.arrowMazeLevel || 1;
      this.updateStats();
    });
    document.querySelectorAll('.dir-btn').forEach(btn => {
      btn.addEventListener('click', () => this.move(btn.dataset.dir));
    });
    document.addEventListener('keydown', (e) => {
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.key]) this.move(map[e.key]);
    });
    this.newGame();
  }
  newGame() {
    this.grid = Array(this.size).fill(null).map(() =>
      Array(this.size).fill(null).map(() => this.arrows[Math.floor(Math.random() * 4)])
    );
    this.player = { x: 0, y: 0 };
    this.goal = { x: this.size - 1, y: this.size - 1 };
    this.grid[this.goal.y][this.goal.x] = '🎯';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    this.render();
  }
  getArrowDir(arrow) {
    const map = { '↑': 'up', '↓': 'down', '←': 'left', '→': 'right' };
    return map[arrow];
  }
  move(dir) {
    const currentArrow = this.grid[this.player.y][this.player.x];
    const requiredDir = this.getArrowDir(currentArrow);
    const fb = document.getElementById('feedback');
    if (requiredDir && dir !== requiredDir) {
      fb.textContent = `Follow the ${currentArrow} arrow!`;
      fb.className = 'feedback wrong';
      return;
    }
    const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = delta[dir];
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) {
      fb.textContent = 'Cannot move there!';
      fb.className = 'feedback wrong';
      return;
    }
    this.player = { x: nx, y: ny };
    fb.textContent = '';
    this.render();
    if (nx === this.goal.x && ny === this.goal.y) {
      this.score += 20 * this.level;
      this.level = Math.min(this.level + 1, 10);
      chrome.storage.local.set({ arrowMazeScore: this.score, arrowMazeLevel: this.level });
      this.updateStats();
      fb.textContent = '🎉 Goal reached!';
      fb.className = 'feedback win';
      setTimeout(() => this.newGame(), 1000);
    }
  }
  render() {
    const el = document.getElementById('grid');
    el.innerHTML = '';
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (x === this.player.x && y === this.player.y) {
          cell.classList.add('player');
          cell.textContent = '😊';
        } else if (x === this.goal.x && y === this.goal.y) {
          cell.classList.add('goal');
          cell.textContent = '🎯';
        } else {
          cell.textContent = this.grid[y][x];
        }
        el.appendChild(cell);
      }
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new ArrowMaze());
