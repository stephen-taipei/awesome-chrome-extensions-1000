// Aim Trainer - Popup Script
class AimTrainer {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.totalTargets = 30;
    this.playing = false;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('arena').addEventListener('click', (e) => {
      if (this.playing && e.target.classList.contains('arena')) this.miss();
    });
  }
  start() {
    this.hits = 0;
    this.misses = 0;
    this.playing = true;
    document.getElementById('hits').textContent = '0';
    document.getElementById('accuracy').textContent = '0';
    const result = document.querySelector('.result');
    if (result) result.remove();
    this.spawnTarget();
  }
  spawnTarget() {
    if (!this.playing || this.hits >= this.totalTargets) {
      this.end();
      return;
    }
    const arena = document.getElementById('arena');
    arena.innerHTML = '';
    const target = document.createElement('div');
    target.className = 'target';
    const x = Math.random() * (arena.clientWidth - 60) + 30;
    const y = Math.random() * (arena.clientHeight - 60) + 30;
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hit();
    });
    arena.appendChild(target);
  }
  hit() {
    this.hits++;
    this.updateStats();
    this.spawnTarget();
  }
  miss() {
    this.misses++;
    this.updateStats();
  }
  updateStats() {
    document.getElementById('hits').textContent = this.hits;
    const total = this.hits + this.misses;
    const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy;
  }
  end() {
    this.playing = false;
    document.getElementById('arena').innerHTML = '';
    const total = this.hits + this.misses;
    const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 0;
    const result = document.createElement('div');
    result.className = 'result';
    result.textContent = `Done! ${this.hits}/${this.totalTargets} hits, ${accuracy}% accuracy`;
    document.getElementById('arena').before(result);
  }
}
document.addEventListener('DOMContentLoaded', () => new AimTrainer());
