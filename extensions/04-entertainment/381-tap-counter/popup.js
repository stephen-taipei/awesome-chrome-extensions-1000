// Tap Counter - Popup Script
class TapCounter {
  constructor() {
    this.taps = 0;
    this.best = 0;
    this.timeLeft = 10;
    this.timer = null;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['tapBest'], (r) => {
      this.best = r.tapBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('tapBtn').addEventListener('click', () => this.tap());
    document.getElementById('tapBtn').disabled = true;
  }
  start() {
    this.taps = 0;
    this.timeLeft = 10;
    this.playing = true;
    document.getElementById('taps').textContent = '0';
    document.getElementById('timer').textContent = '10.0';
    document.getElementById('cps').textContent = '';
    document.getElementById('tapBtn').disabled = false;
    document.getElementById('startBtn').disabled = true;
    this.runTimer();
  }
  tap() {
    if (!this.playing) return;
    this.taps++;
    document.getElementById('taps').textContent = this.taps;
  }
  runTimer() {
    this.timer = setInterval(() => {
      this.timeLeft -= 0.1;
      document.getElementById('timer').textContent = Math.max(0, this.timeLeft).toFixed(1);
      if (this.timeLeft <= 0) this.end();
    }, 100);
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    document.getElementById('tapBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    const cps = (this.taps / 10).toFixed(1);
    document.getElementById('cps').textContent = cps + ' taps per second';
    if (this.taps > this.best) {
      this.best = this.taps;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ tapBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new TapCounter());
