// Arrow Dodge - Popup Script
class ArrowDodge {
  constructor() {
    this.playerX = 114;
    this.playerY = 96;
    this.arrows = [];
    this.playing = false;
    this.startTime = 0;
    this.best = 0;
    this.timer = null;
    this.spawnTimer = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['arrowDodgeBest'], (r) => {
      this.best = r.arrowDodgeBest || 0;
      document.getElementById('best').textContent = this.best.toFixed(1);
    });
    document.addEventListener('keydown', (e) => this.handleKey(e));
    this.render();
  }
  handleKey(e) {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    if (!this.playing) {
      this.start();
    }
    const step = 20;
    if (e.key === 'ArrowUp') this.playerY = Math.max(0, this.playerY - step);
    if (e.key === 'ArrowDown') this.playerY = Math.min(192, this.playerY + step);
    if (e.key === 'ArrowLeft') this.playerX = Math.max(0, this.playerX - step);
    if (e.key === 'ArrowRight') this.playerX = Math.min(228, this.playerX + step);
    this.render();
  }
  start() {
    this.playing = true;
    this.arrows = [];
    this.playerX = 114;
    this.playerY = 96;
    this.startTime = Date.now();
    document.getElementById('startMsg').classList.add('hidden');
    this.timer = setInterval(() => this.update(), 30);
    this.spawnTimer = setInterval(() => this.spawn(), 500);
  }
  spawn() {
    const side = Math.floor(Math.random() * 4);
    let x, y, dx, dy, emoji;
    if (side === 0) { x = Math.random() * 228; y = -20; dx = 0; dy = 3; emoji = '⬇️'; }
    else if (side === 1) { x = Math.random() * 228; y = 220; dx = 0; dy = -3; emoji = '⬆️'; }
    else if (side === 2) { x = -20; y = Math.random() * 192; dx = 3; dy = 0; emoji = '➡️'; }
    else { x = 256; y = Math.random() * 192; dx = -3; dy = 0; emoji = '⬅️'; }
    this.arrows.push({ x, y, dx, dy, emoji });
  }
  update() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    document.getElementById('time').textContent = elapsed.toFixed(1);
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      a.x += a.dx;
      a.y += a.dy;
      if (a.x < -30 || a.x > 280 || a.y < -30 || a.y > 250) {
        this.arrows.splice(i, 1);
        continue;
      }
      if (Math.abs(a.x - this.playerX) < 24 && Math.abs(a.y - this.playerY) < 24) {
        this.end(elapsed);
        return;
      }
    }
    this.render();
  }
  end(time) {
    clearInterval(this.timer);
    clearInterval(this.spawnTimer);
    this.playing = false;
    document.getElementById('startMsg').textContent = 'Game Over! ' + time.toFixed(1) + 's\nPress arrow to retry';
    document.getElementById('startMsg').classList.remove('hidden');
    if (time > this.best) {
      this.best = time;
      document.getElementById('best').textContent = this.best.toFixed(1);
      chrome.storage.local.set({ arrowDodgeBest: this.best });
    }
  }
  render() {
    const player = document.getElementById('player');
    player.style.left = this.playerX + 'px';
    player.style.top = this.playerY + 'px';
    const arena = document.getElementById('arena');
    arena.querySelectorAll('.arrow').forEach(a => a.remove());
    this.arrows.forEach(a => {
      const el = document.createElement('div');
      el.className = 'arrow';
      el.textContent = a.emoji;
      el.style.left = a.x + 'px';
      el.style.top = a.y + 'px';
      arena.appendChild(el);
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new ArrowDodge());
