// Chain Reaction - Popup Script
class ChainReaction {
  constructor() {
    this.level = 1;
    this.bubbles = [];
    this.popped = 0;
    this.target = 5;
    this.clicked = false;
    this.colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    this.init();
  }
  init() {
    chrome.storage.local.get(['chainReactionLevel'], (r) => {
      this.level = r.chainReactionLevel || 1;
      document.getElementById('level').textContent = this.level;
      this.startLevel();
    });
    document.getElementById('arena').addEventListener('click', (e) => this.onClick(e));
    document.getElementById('nextBtn').addEventListener('click', () => this.nextLevel());
  }
  startLevel() {
    this.bubbles = [];
    this.popped = 0;
    this.clicked = false;
    this.target = Math.min(5 + this.level * 2, 25);
    const count = 10 + this.level * 3;
    document.getElementById('target').textContent = this.target;
    document.getElementById('feedback').textContent = 'Click to start reaction!';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('nextBtn').style.display = 'none';
    const arena = document.getElementById('arena');
    arena.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const bubble = {
        x: Math.random() * 250 + 25,
        y: Math.random() * 180 + 20,
        r: 15 + Math.random() * 10,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        alive: true
      };
      this.bubbles.push(bubble);
    }
    this.render();
    this.animate();
  }
  render() {
    const arena = document.getElementById('arena');
    arena.innerHTML = this.bubbles.filter(b => b.alive).map((b, i) =>
      `<div class="bubble" data-i="${i}" style="left:${b.x}px;top:${b.y}px;width:${b.r * 2}px;height:${b.r * 2}px;background:${b.color}"></div>`
    ).join('');
  }
  animate() {
    if (this.clicked) return;
    this.bubbles.forEach(b => {
      if (!b.alive) return;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < b.r || b.x > 300 - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > 220 - b.r) b.vy *= -1;
    });
    this.render();
    requestAnimationFrame(() => this.animate());
  }
  onClick(e) {
    if (this.clicked) return;
    this.clicked = true;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.explode(x, y, 30);
  }
  explode(x, y, r) {
    this.bubbles.forEach((b, i) => {
      if (!b.alive) return;
      const dist = Math.sqrt((b.x - x) ** 2 + (b.y - y) ** 2);
      if (dist < r + b.r) {
        b.alive = false;
        this.popped++;
        const el = document.querySelector(`.bubble[data-i="${i}"]`);
        if (el) {
          el.classList.add('exploding');
          setTimeout(() => this.explode(b.x, b.y, b.r * 1.5), 200);
        }
      }
    });
    setTimeout(() => this.checkEnd(), 500);
  }
  checkEnd() {
    const aliveCount = this.bubbles.filter(b => b.alive).length;
    if (aliveCount === this.bubbles.length - this.popped) return;
    setTimeout(() => this.checkEnd(), 300);
    if (this.bubbles.every(b => !b.alive || this.popped >= this.target)) {
      this.endLevel();
    }
  }
  endLevel() {
    const fb = document.getElementById('feedback');
    if (this.popped >= this.target) {
      fb.textContent = `🎉 Popped ${this.popped}! Level complete!`;
      fb.className = 'feedback win';
      document.getElementById('nextBtn').style.display = 'block';
    } else {
      fb.textContent = `💥 Popped ${this.popped}/${this.target}. Try again!`;
      fb.className = 'feedback lose';
      setTimeout(() => this.startLevel(), 1500);
    }
  }
  nextLevel() {
    this.level++;
    chrome.storage.local.set({ chainReactionLevel: this.level });
    document.getElementById('level').textContent = this.level;
    this.startLevel();
  }
}
document.addEventListener('DOMContentLoaded', () => new ChainReaction());
