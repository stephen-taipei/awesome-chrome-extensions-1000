// Tetris - Popup Script
class Tetris {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.cols = 10; this.rows = 20; this.block = 20;
    this.grid = [];
    this.pieces = [[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
    this.colors = ['#00f0f0','#f0f000','#a000f0','#0000f0','#f0a000','#00f000','#f00000'];
    this.current = null;
    this.score = 0;
    this.lines = 0;
    this.playing = false;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.querySelectorAll('.ctrl').forEach(btn => {
      btn.addEventListener('click', () => this.action(btn.dataset.action));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.action('left');
      if (e.key === 'ArrowRight') this.action('right');
      if (e.key === 'ArrowDown') this.action('down');
      if (e.key === 'ArrowUp') this.action('rotate');
    });
    this.draw();
  }
  start() {
    this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    this.score = 0; this.lines = 0;
    this.updateStats();
    this.newPiece();
    this.playing = true;
    this.loop();
  }
  newPiece() {
    const idx = Math.floor(Math.random() * this.pieces.length);
    this.current = {shape: this.pieces[idx].map(r => [...r]), color: this.colors[idx], x: 3, y: 0};
  }
  loop() {
    if (!this.playing) return;
    this.moveDown();
    this.draw();
    setTimeout(() => this.loop(), 500);
  }
  action(act) {
    if (!this.playing) return;
    if (act === 'left') this.move(-1);
    if (act === 'right') this.move(1);
    if (act === 'down') this.moveDown();
    if (act === 'rotate') this.rotate();
    this.draw();
  }
  move(dx) {
    this.current.x += dx;
    if (this.collides()) this.current.x -= dx;
  }
  moveDown() {
    this.current.y++;
    if (this.collides()) {
      this.current.y--;
      this.lock();
      this.clearLines();
      this.newPiece();
      if (this.collides()) this.playing = false;
    }
  }
  rotate() {
    const rotated = this.current.shape[0].map((_, i) => this.current.shape.map(r => r[i]).reverse());
    const old = this.current.shape;
    this.current.shape = rotated;
    if (this.collides()) this.current.shape = old;
  }
  collides() {
    for (let r = 0; r < this.current.shape.length; r++) {
      for (let c = 0; c < this.current.shape[r].length; c++) {
        if (this.current.shape[r][c]) {
          const x = this.current.x + c, y = this.current.y + r;
          if (x < 0 || x >= this.cols || y >= this.rows || (y >= 0 && this.grid[y][x])) return true;
        }
      }
    }
    return false;
  }
  lock() {
    for (let r = 0; r < this.current.shape.length; r++) {
      for (let c = 0; c < this.current.shape[r].length; c++) {
        if (this.current.shape[r][c] && this.current.y + r >= 0) {
          this.grid[this.current.y + r][this.current.x + c] = this.current.color;
        }
      }
    }
  }
  clearLines() {
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every(c => c)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        cleared++; r++;
      }
    }
    this.lines += cleared;
    this.score += cleared * 100;
    this.updateStats();
  }
  draw() {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          this.ctx.fillStyle = this.grid[r][c];
          this.ctx.fillRect(c * this.block, r * this.block, this.block - 1, this.block - 1);
        }
      }
    }
    if (this.current) {
      this.ctx.fillStyle = this.current.color;
      for (let r = 0; r < this.current.shape.length; r++) {
        for (let c = 0; c < this.current.shape[r].length; c++) {
          if (this.current.shape[r][c]) {
            this.ctx.fillRect((this.current.x + c) * this.block, (this.current.y + r) * this.block, this.block - 1, this.block - 1);
          }
        }
      }
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lines').textContent = this.lines;
  }
}
document.addEventListener('DOMContentLoaded', () => new Tetris());
