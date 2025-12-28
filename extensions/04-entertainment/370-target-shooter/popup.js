// Target Shooter - Popup Script
class TargetShooter {
  constructor() {
    this.hits = 0;
    this.maxHits = 20;
    this.startTime = 0;
    this.timer = null;
    this.best = null;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['targetBest'], (r) => {
      this.best = r.targetBest || null;
      document.getElementById('best').textContent = this.best ? this.best.toFixed(2) + 's' : '--';
    });
    document.getElementById('overlay').addEventListener('click', () => this.start());
    document.getElementById('target').addEventListener('click', (e) => {
      e.stopPropagation();
      this.hit();
    });
  }
  start() {
    this.hits = 0;
    this.playing = true;
    this.startTime = Date.now();
    document.getElementById('hits').textContent = '0';
    document.getElementById('time').textContent = '0.00';
    document.getElementById('message').textContent = '';
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('target').style.display = 'block';
    this.moveTarget();
    this.runTimer();
  }
  runTimer() {
    this.timer = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      document.getElementById('time').textContent = elapsed.toFixed(2);
    }, 50);
  }
  moveTarget() {
    const target = document.getElementById('target');
    const arena = document.getElementById('arena');
    const maxX = arena.offsetWidth - 40;
    const maxY = arena.offsetHeight - 40;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.className = 'target';
  }
  hit() {
    if (!this.playing) return;
    this.hits++;
    document.getElementById('hits').textContent = this.hits;
    const target = document.getElementById('target');
    target.classList.add('hit');
    if (this.hits >= this.maxHits) {
      this.end();
    } else {
      setTimeout(() => this.moveTarget(), 100);
    }
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    const finalTime = (Date.now() - this.startTime) / 1000;
    document.getElementById('time').textContent = finalTime.toFixed(2);
    document.getElementById('target').style.display = 'none';
    let msg = 'Time: ' + finalTime.toFixed(2) + 's';
    if (this.best === null || finalTime < this.best) {
      this.best = finalTime;
      chrome.storage.local.set({ targetBest: this.best });
      document.getElementById('best').textContent = this.best.toFixed(2) + 's';
      msg += ' - New Record!';
    }
    document.getElementById('message').textContent = msg;
    document.getElementById('overlay').textContent = 'Play Again';
    document.getElementById('overlay').classList.remove('hidden');
  }
}
document.addEventListener('DOMContentLoaded', () => new TargetShooter());
