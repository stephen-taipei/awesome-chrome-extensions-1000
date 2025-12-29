// Gravity Ball - Popup Script
class GravityBall {
  constructor() {
    this.ballY = 98;
    this.velY = 0;
    this.gravity = 0.4;
    this.obstacles = [];
    this.score = 0;
    this.best = 0;
    this.playing = false;
    this.loop = null;
    this.spawnTimer = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['gravityBallBest'], (r) => {
      this.best = r.gravityBallBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('arena').addEventListener('click', () => this.handleClick());
  }
  handleClick() {
    if (!this.playing) {
      this.start();
    } else {
      this.gravity *= -1;
    }
  }
  start() {
    this.ballY = 98;
    this.velY = 0;
    this.gravity = 0.4;
    this.obstacles = [];
    this.score = 0;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('startMsg').classList.add('hidden');
    document.getElementById('arena').querySelectorAll('.obstacle').forEach(o => o.remove());
    this.loop = setInterval(() => this.update(), 20);
    this.spawnTimer = setInterval(() => this.spawn(), 1500);
  }
  spawn() {
    const gapY = Math.floor(Math.random() * 100) + 40;
    const gapSize = 60;
    this.obstacles.push({ x: 256, gapY, gapSize, passed: false });
  }
  update() {
    this.velY += this.gravity;
    this.ballY += this.velY;
    if (this.ballY < 0 || this.ballY > 196) {
      this.end();
      return;
    }
    const arena = document.getElementById('arena');
    arena.querySelectorAll('.obstacle').forEach(o => o.remove());
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= 3;
      if (o.x < -30) {
        this.obstacles.splice(i, 1);
        continue;
      }
      // Check collision (ball at x=30, width=24)
      if (o.x < 54 && o.x > 6) {
        if (this.ballY < o.gapY || this.ballY > o.gapY + o.gapSize - 24) {
          this.end();
          return;
        }
        if (!o.passed && o.x < 30) {
          o.passed = true;
          this.score++;
          document.getElementById('score').textContent = this.score;
        }
      }
      // Draw obstacles
      const top = document.createElement('div');
      top.className = 'obstacle';
      top.style.left = o.x + 'px';
      top.style.top = '0';
      top.style.width = '20px';
      top.style.height = o.gapY + 'px';
      arena.appendChild(top);
      const bottom = document.createElement('div');
      bottom.className = 'obstacle';
      bottom.style.left = o.x + 'px';
      bottom.style.top = (o.gapY + o.gapSize) + 'px';
      bottom.style.width = '20px';
      bottom.style.height = (220 - o.gapY - o.gapSize) + 'px';
      arena.appendChild(bottom);
    }
    document.getElementById('ball').style.top = this.ballY + 'px';
  }
  end() {
    clearInterval(this.loop);
    clearInterval(this.spawnTimer);
    this.playing = false;
    document.getElementById('startMsg').textContent = 'Score: ' + this.score + ' - Click to retry';
    document.getElementById('startMsg').classList.remove('hidden');
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ gravityBallBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new GravityBall());
