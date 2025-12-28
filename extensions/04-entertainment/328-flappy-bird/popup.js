// Flappy Jump - Popup Script
class FlappyJump {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.bird = {x: 60, y: 175, vy: 0, r: 15};
    this.pipes = [];
    this.score = 0;
    this.best = 0;
    this.playing = false;
    this.gravity = 0.4;
    this.jump = -7;
    this.init();
  }
  init() {
    this.canvas.addEventListener('click', () => this.flap());
    document.getElementById('playBtn').addEventListener('click', () => this.flap());
    document.addEventListener('keydown', (e) => { if (e.code === 'Space') this.flap(); });
    this.loadBest();
    this.draw();
  }
  start() {
    this.bird = {x: 60, y: 175, vy: 0, r: 15};
    this.pipes = [];
    this.score = 0;
    document.getElementById('score').textContent = '0';
    this.playing = true;
    this.spawnPipe();
    this.loop();
  }
  flap() {
    if (!this.playing) {
      this.start();
    } else {
      this.bird.vy = this.jump;
    }
  }
  spawnPipe() {
    const gap = 100;
    const minH = 50;
    const maxH = this.canvas.height - gap - minH - 50;
    const topH = Math.random() * maxH + minH;
    this.pipes.push({x: this.canvas.width, topH: topH, gap: gap, passed: false});
  }
  loop() {
    if (!this.playing) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
  update() {
    this.bird.vy += this.gravity;
    this.bird.y += this.bird.vy;
    if (this.bird.y < 0 || this.bird.y > this.canvas.height - 30) {
      this.gameOver();
      return;
    }
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= 3;
      if (p.x + 40 < 0) {
        this.pipes.splice(i, 1);
        continue;
      }
      if (!p.passed && p.x + 40 < this.bird.x) {
        p.passed = true;
        this.score++;
        document.getElementById('score').textContent = this.score;
      }
      if (this.bird.x + this.bird.r > p.x && this.bird.x - this.bird.r < p.x + 40) {
        if (this.bird.y - this.bird.r < p.topH || this.bird.y + this.bird.r > p.topH + p.gap) {
          this.gameOver();
          return;
        }
      }
    }
    if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 150) {
      this.spawnPipe();
    }
  }
  draw() {
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);
    this.ctx.fillStyle = '#228b22';
    this.ctx.fillRect(0, this.canvas.height - 35, this.canvas.width, 10);
    this.ctx.fillStyle = '#22c55e';
    this.pipes.forEach(p => {
      this.ctx.fillRect(p.x, 0, 40, p.topH);
      this.ctx.fillRect(p.x, p.topH + p.gap, 40, this.canvas.height - p.topH - p.gap - 30);
    });
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.r, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + 5, this.bird.y - 3, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }
  gameOver() {
    this.playing = false;
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      this.saveBest();
    }
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Click to restart', this.canvas.width/2, this.canvas.height/2 + 30);
  }
  saveBest() { chrome.storage.local.set({ flappyBest: this.best }); }
  loadBest() {
    chrome.storage.local.get(['flappyBest'], (r) => {
      this.best = r.flappyBest || 0;
      document.getElementById('best').textContent = this.best;
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new FlappyJump());
