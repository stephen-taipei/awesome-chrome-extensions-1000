// Speed Click - Popup Script
class SpeedClick {
  constructor() {
    this.clicks = 0;
    this.maxClicks = 30;
    this.startTime = 0;
    this.timer = null;
    this.best = null;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['speedClickBest'], (r) => {
      this.best = r.speedClickBest || null;
      document.getElementById('best').textContent = this.best ? this.best.toFixed(2) + 's' : '--';
    });
    document.getElementById('arena').addEventListener('click', (e) => {
      if (!this.playing && e.target.id !== 'target') this.start();
    });
    document.getElementById('target').addEventListener('click', (e) => {
      e.stopPropagation();
      this.hit();
    });
  }
  start() {
    this.clicks = 0;
    this.playing = true;
    this.startTime = Date.now();
    document.getElementById('clicks').textContent = '0';
    document.getElementById('time').textContent = '0.00';
    document.getElementById('startMsg').classList.add('hidden');
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
    const x = Math.floor(Math.random() * 216);
    const y = Math.floor(Math.random() * 160);
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.style.display = 'block';
  }
  hit() {
    if (!this.playing) return;
    this.clicks++;
    document.getElementById('clicks').textContent = this.clicks;
    if (this.clicks >= this.maxClicks) {
      this.end();
    } else {
      this.moveTarget();
    }
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    const finalTime = (Date.now() - this.startTime) / 1000;
    document.getElementById('time').textContent = finalTime.toFixed(2);
    document.getElementById('target').style.display = 'none';
    document.getElementById('startMsg').textContent = finalTime.toFixed(2) + 's - Click to retry';
    document.getElementById('startMsg').classList.remove('hidden');
    if (this.best === null || finalTime < this.best) {
      this.best = finalTime;
      document.getElementById('best').textContent = this.best.toFixed(2) + 's';
      chrome.storage.local.set({ speedClickBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new SpeedClick());
