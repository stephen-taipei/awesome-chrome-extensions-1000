// Breakout - Popup Script
class Breakout {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.paddle = {x: 110, y: 300, w: 60, h: 10};
    this.ball = {x: 140, y: 290, dx: 3, dy: -3, r: 6};
    this.bricks = [];
    this.score = 0;
    this.lives = 3;
    this.playing = false;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('leftBtn').addEventListener('mousedown', () => this.moveLeft = true);
    document.getElementById('leftBtn').addEventListener('mouseup', () => this.moveLeft = false);
    document.getElementById('rightBtn').addEventListener('mousedown', () => this.moveRight = true);
    document.getElementById('rightBtn').addEventListener('mouseup', () => this.moveRight = false);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.moveLeft = true;
      if (e.key === 'ArrowRight') this.moveRight = true;
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') this.moveLeft = false;
      if (e.key === 'ArrowRight') this.moveRight = false;
    });
    this.createBricks();
    this.draw();
  }
  createBricks() {
    this.bricks = [];
    const colors = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6'];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        this.bricks.push({x: c*40+2, y: r*20+30, w: 36, h: 16, color: colors[r], active: true});
      }
    }
  }
  start() {
    this.paddle.x = 110;
    this.ball = {x: 140, y: 290, dx: 3, dy: -3, r: 6};
    this.score = 0;
    this.lives = 3;
    this.createBricks();
    this.updateStats();
    this.playing = true;
    this.loop();
  }
  loop() {
    if (!this.playing) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
  update() {
    if (this.moveLeft && this.paddle.x > 0) this.paddle.x -= 6;
    if (this.moveRight && this.paddle.x < this.canvas.width - this.paddle.w) this.paddle.x += 6;
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    if (this.ball.x <= this.ball.r || this.ball.x >= this.canvas.width - this.ball.r) this.ball.dx *= -1;
    if (this.ball.y <= this.ball.r) this.ball.dy *= -1;
    if (this.ball.y >= this.paddle.y - this.ball.r && this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + this.paddle.w) {
      this.ball.dy = -Math.abs(this.ball.dy);
    }
    if (this.ball.y > this.canvas.height) {
      this.lives--;
      this.updateStats();
      if (this.lives <= 0) { this.playing = false; return; }
      this.ball = {x: 140, y: 290, dx: 3, dy: -3, r: 6};
    }
    this.bricks.forEach(b => {
      if (b.active && this.ball.x > b.x && this.ball.x < b.x + b.w && this.ball.y > b.y && this.ball.y < b.y + b.h) {
        b.active = false;
        this.ball.dy *= -1;
        this.score += 10;
        this.updateStats();
      }
    });
    if (this.bricks.every(b => !b.active)) this.playing = false;
  }
  draw() {
    this.ctx.fillStyle = '#0f0f1f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    this.ctx.fill();
    this.bricks.forEach(b => {
      if (b.active) {
        this.ctx.fillStyle = b.color;
        this.ctx.fillRect(b.x, b.y, b.w, b.h);
      }
    });
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
  }
}
document.addEventListener('DOMContentLoaded', () => new Breakout());
