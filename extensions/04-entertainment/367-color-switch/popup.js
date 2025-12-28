// Color Switch - Popup Script
class ColorSwitch {
  constructor() {
    this.colors = ['c0', 'c1', 'c2', 'c3'];
    this.ballColor = 0;
    this.gateColor = 0;
    this.score = 0;
    this.best = 0;
    this.gameRunning = false;
    this.gateY = 40;
    this.interval = null;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['switchBest']);
    this.best = data.switchBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    this.renderColors();
    this.updateBall();
    this.renderGate();
  }
  renderColors() {
    const container = document.getElementById('colors');
    container.innerHTML = this.colors.map((c, i) => `<button class="color-btn ${c}" data-idx="${i}"></button>`).join('');
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-btn')) {
        this.switchColor(parseInt(e.target.dataset.idx));
      }
    });
  }
  start() {
    this.score = 0;
    this.gateY = 40;
    this.gameRunning = true;
    this.gateColor = Math.floor(Math.random() * 4);
    document.getElementById('score').textContent = 0;
    document.getElementById('startBtn').style.display = 'none';
    this.renderGate();
    this.interval = setInterval(() => this.tick(), 50);
  }
  switchColor(idx) {
    this.ballColor = idx;
    this.updateBall();
  }
  updateBall() {
    const ball = document.getElementById('ball');
    ball.className = 'ball ' + this.colors[this.ballColor];
    document.querySelectorAll('.color-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === this.ballColor);
    });
  }
  renderGate() {
    const gate = document.getElementById('gate');
    gate.style.top = this.gateY + 'px';
    gate.innerHTML = this.colors.map(c => `<div class="gate-part ${c}"></div>`).join('');
  }
  tick() {
    this.gateY += 2;
    if (this.gateY >= 150) {
      if (this.ballColor === this.gateColor) {
        this.score++;
        document.getElementById('score').textContent = this.score;
        if (this.score > this.best) {
          this.best = this.score;
          document.getElementById('best').textContent = this.best;
          chrome.storage.local.set({ switchBest: this.best });
        }
        this.gateY = 40;
        this.gateColor = Math.floor(Math.random() * 4);
        this.renderGate();
      } else {
        this.gameOver();
      }
    }
    document.getElementById('gate').style.top = this.gateY + 'px';
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    document.getElementById('startBtn').textContent = `Game Over! Score: ${this.score} - Play Again`;
    document.getElementById('startBtn').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorSwitch());
