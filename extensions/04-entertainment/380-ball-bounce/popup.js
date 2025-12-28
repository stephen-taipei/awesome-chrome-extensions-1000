// Ball Bounce - Popup Script
class BallBounce {
  constructor() {
    this.ballX = 114;
    this.ballY = 50;
    this.velX = 2;
    this.velY = 0;
    this.gravity = 0.3;
    this.score = 0;
    this.best = 0;
    this.playing = false;
    this.loop = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['ballBounceBest'], (r) => {
      this.best = r.ballBounceBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    const arena = document.getElementById('arena');
    arena.addEventListener('click', (e) => this.handleClick(e));
    arena.addEventListener('mousemove', (e) => this.movePlatform(e));
  }
  handleClick(e) {
    if (!this.playing) {
      this.start();
    }
  }
  start() {
    this.ballX = 114;
    this.ballY = 50;
    this.velX = (Math.random() - 0.5) * 4;
    this.velY = 0;
    this.score = 0;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('startMsg').classList.add('hidden');
    this.run();
  }
  run() {
    this.loop = setInterval(() => this.update(), 20);
  }
  update() {
    this.velY += this.gravity;
    this.ballX += this.velX;
    this.ballY += this.velY;
    // Wall bounce
    if (this.ballX < 0 || this.ballX > 228) {
      this.velX *= -1;
      this.ballX = Math.max(0, Math.min(228, this.ballX));
    }
    // Top bounce
    if (this.ballY < 0) {
      this.ballY = 0;
      this.velY *= -0.8;
    }
    // Platform check
    const platform = document.getElementById('platform');
    const platX = platform.offsetLeft;
    const platY = 188;
    if (this.ballY >= platY - 14 && this.ballY <= platY && this.ballX >= platX - 14 && this.ballX <= platX + 60) {
      this.velY = -8 - Math.random() * 2;
      this.velX += (this.ballX - platX - 30) * 0.1;
      this.score++;
      document.getElementById('score').textContent = this.score;
    }
    // Game over
    if (this.ballY > 220) {
      this.end();
      return;
    }
    const ball = document.getElementById('ball');
    ball.style.left = this.ballX + 'px';
    ball.style.top = this.ballY + 'px';
  }
  movePlatform(e) {
    if (!this.playing) return;
    const arena = document.getElementById('arena');
    const rect = arena.getBoundingClientRect();
    let x = e.clientX - rect.left - 30;
    x = Math.max(0, Math.min(196, x));
    document.getElementById('platform').style.left = x + 'px';
    document.getElementById('platform').style.transform = 'none';
  }
  end() {
    clearInterval(this.loop);
    this.playing = false;
    document.getElementById('startMsg').textContent = 'Score: ' + this.score + ' - Click to retry';
    document.getElementById('startMsg').classList.remove('hidden');
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ ballBounceBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new BallBounce());
