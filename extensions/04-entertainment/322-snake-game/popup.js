// Snake Game - Popup Script
class Snake {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 14;
    this.tileCount = 20;
    this.snake = [{x:10,y:10}];
    this.food = {x:15,y:15};
    this.dx = 0; this.dy = 0;
    this.score = 0;
    this.best = 0;
    this.gameLoop = null;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.querySelectorAll('.ctrl').forEach(btn => {
      btn.addEventListener('click', () => this.setDirection(btn.dataset.dir));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') this.setDirection('up');
      if (e.key === 'ArrowDown') this.setDirection('down');
      if (e.key === 'ArrowLeft') this.setDirection('left');
      if (e.key === 'ArrowRight') this.setDirection('right');
    });
    this.loadBest();
    this.draw();
  }
  start() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.snake = [{x:10,y:10}];
    this.dx = 1; this.dy = 0;
    this.score = 0;
    document.getElementById('score').textContent = '0';
    this.placeFood();
    this.gameLoop = setInterval(() => this.update(), 100);
  }
  setDirection(dir) {
    if (dir === 'up' && this.dy !== 1) { this.dx = 0; this.dy = -1; }
    if (dir === 'down' && this.dy !== -1) { this.dx = 0; this.dy = 1; }
    if (dir === 'left' && this.dx !== 1) { this.dx = -1; this.dy = 0; }
    if (dir === 'right' && this.dx !== -1) { this.dx = 1; this.dy = 0; }
  }
  update() {
    const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) return this.gameOver();
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) return this.gameOver();
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      document.getElementById('score').textContent = this.score;
      this.placeFood();
    } else {
      this.snake.pop();
    }
    this.draw();
  }
  placeFood() {
    do {
      this.food = {x: Math.floor(Math.random() * this.tileCount), y: Math.floor(Math.random() * this.tileCount)};
    } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
  }
  draw() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#22c55e';
    this.snake.forEach(s => this.ctx.fillRect(s.x * this.gridSize, s.y * this.gridSize, this.gridSize - 1, this.gridSize - 1));
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 1, this.gridSize - 1);
  }
  gameOver() {
    clearInterval(this.gameLoop);
    this.gameLoop = null;
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      this.saveBest();
    }
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
  }
  saveBest() { chrome.storage.local.set({ snakeBest: this.best }); }
  loadBest() {
    chrome.storage.local.get(['snakeBest'], (r) => {
      this.best = r.snakeBest || 0;
      document.getElementById('best').textContent = this.best;
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new Snake());
