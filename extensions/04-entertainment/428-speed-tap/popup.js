// Speed Tap - Popup Script
class SpeedTap {
  constructor() {
    this.taps = 0;
    this.time = 10;
    this.best = 0;
    this.running = false;
    this.timer = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['speedTapBest'], (r) => {
      this.best = r.speedTapBest || 0;
      this.updateDisplay();
    });
    document.getElementById('tapBtn').addEventListener('click', () => this.tap());
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('tapBtn').disabled = true;
  }
  start() {
    this.taps = 0;
    this.time = 10;
    this.running = true;
    document.getElementById('tapBtn').disabled = false;
    document.getElementById('startBtn').disabled = true;
    this.updateDisplay();
    this.timer = setInterval(() => {
      this.time--;
      this.updateDisplay();
      if (this.time <= 0) this.end();
    }, 1000);
  }
  tap() {
    if (!this.running) return;
    this.taps++;
    this.updateDisplay();
  }
  end() {
    this.running = false;
    clearInterval(this.timer);
    document.getElementById('tapBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;
    if (this.taps > this.best) {
      this.best = this.taps;
      chrome.storage.local.set({ speedTapBest: this.best });
    }
    this.updateDisplay();
  }
  updateDisplay() {
    document.getElementById('best').textContent = this.best;
    document.getElementById('time').textContent = this.time;
    document.getElementById('taps').textContent = this.taps;
  }
}
document.addEventListener('DOMContentLoaded', () => new SpeedTap());
