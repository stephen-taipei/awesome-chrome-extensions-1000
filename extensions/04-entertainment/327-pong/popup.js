// Pong - Popup Script
class Pong {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.paddleH = 50;
    this.paddleW = 8;
    this.player = {y: this.h/2 - 25};
    this.cpu = {y: this.h/2 - 25};
    this.ball = {x: this.w/2, y: this.h/2, dx: 4, dy: 3, r: 6};
    this.playerScore = 0;
    this.cpuScore = 0;
    this.playing = false;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('upBtn').addEventListener('mousedown', () => this.moveUp = true);
    document.getElementById('upBtn').addEventListener('mouseup', () => this.moveUp = false);
    document.getElementById('downBtn').addEventListener('mousedown', () => this.moveDown = true);
    document.getElementById('downBtn').addEventListener('mouseup', () => this.moveDown = false);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') this.moveUp = true;
      if (e.key === 'ArrowDown') this.moveDown = true;
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp') this.moveUp = false;
      if (e.key === 'ArrowDown') this.moveDown = false;
    });
    this.draw();
  }
  start() {
    this.playerScore = 0;
    this.cpuScore = 0;
    this.updateScore();
    this.resetBall();
    this.playing = true;
    this.loop();
  }
  resetBall() {
    this.ball = {x: this.w/2, y: this.h/2, dx: (Math.random() > 0.5 ? 4 : -4), dy: (Math.random() - 0.5) * 6, r: 6};
  }
  loop() {
    if (!this.playing) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
  update() {
    if (this.moveUp && this.player.y > 0) this.player.y -= 5;
    if (this.moveDown && this.player.y < this.h - this.paddleH) this.player.y += 5;
    const cpuCenter = this.cpu.y + this.paddleH/2;
    if (cpuCenter < this.ball.y - 10) this.cpu.y += 3;
    if (cpuCenter > this.ball.y + 10) this.cpu.y -= 3;
    this.cpu.y = Math.max(0, Math.min(this.h - this.paddleH, this.cpu.y));
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    if (this.ball.y <= this.ball.r || this.ball.y >= this.h - this.ball.r) this.ball.dy *= -1;
    if (this.ball.x <= 20 && this.ball.y >= this.player.y && this.ball.y <= this.player.y + this.paddleH) {
      this.ball.dx = Math.abs(this.ball.dx);
      this.ball.dy += (this.ball.y - (this.player.y + this.paddleH/2)) * 0.1;
    }
    if (this.ball.x >= this.w - 20 && this.ball.y >= this.cpu.y && this.ball.y <= this.cpu.y + this.paddleH) {
      this.ball.dx = -Math.abs(this.ball.dx);
    }
    if (this.ball.x < 0) { this.cpuScore++; this.updateScore(); this.resetBall(); }
    if (this.ball.x > this.w) { this.playerScore++; this.updateScore(); this.resetBall(); }
  }
  draw() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = '#333';
    this.ctx.beginPath();
    this.ctx.moveTo(this.w/2, 0);
    this.ctx.lineTo(this.w/2, this.h);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(10, this.player.y, this.paddleW, this.paddleH);
    this.ctx.fillRect(this.w - 18, this.cpu.y, this.paddleW, this.paddleH);
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    this.ctx.fill();
  }
  updateScore() {
    document.getElementById('player').textContent = this.playerScore;
    document.getElementById('cpu').textContent = this.cpuScore;
  }
}
document.addEventListener('DOMContentLoaded', () => new Pong());
