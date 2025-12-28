// Bubble Pop - Popup Script
class BubblePop {
  constructor() {
    this.score = 0;
    this.lives = 3;
    this.playing = false;
    this.spawnInterval = null;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  start() {
    this.score = 0;
    this.lives = 3;
    this.playing = true;
    this.updateUI();
    document.getElementById('game').innerHTML = '';
    this.spawnInterval = setInterval(() => this.spawnBubble(), 800);
  }
  spawnBubble() {
    if (!this.playing) return;
    const game = document.getElementById('game');
    const bubble = document.createElement('div');
    const size = 30 + Math.random() * 30;
    const x = Math.random() * (256 - size);
    bubble.className = 'bubble';
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = x + 'px';
    bubble.style.bottom = '-' + size + 'px';
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${color})`;
    bubble.addEventListener('click', () => this.pop(bubble, size));
    game.appendChild(bubble);
    const duration = 2000 + Math.random() * 2000;
    bubble.style.transition = `bottom ${duration}ms linear`;
    requestAnimationFrame(() => {
      bubble.style.bottom = '200px';
    });
    setTimeout(() => {
      if (bubble.parentNode && !bubble.classList.contains('pop')) {
        bubble.remove();
        this.missedBubble();
      }
    }, duration);
  }
  pop(bubble, size) {
    if (bubble.classList.contains('pop')) return;
    bubble.classList.add('pop');
    this.score += Math.round(60 - size);
    this.updateUI();
    setTimeout(() => bubble.remove(), 200);
  }
  missedBubble() {
    this.lives--;
    this.updateUI();
    if (this.lives <= 0) this.end();
  }
  end() {
    this.playing = false;
    clearInterval(this.spawnInterval);
    document.getElementById('game').innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:18px;color:#60a5fa;">Game Over!<br>Score: ${this.score}</div>`;
  }
  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
  }
}
document.addEventListener('DOMContentLoaded', () => new BubblePop());
