// Number Order - Popup Script
class NumberOrder {
  constructor() {
    this.numbers = [];
    this.next = 1;
    this.started = false;
    this.startTime = 0;
    this.timer = null;
    this.best = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['numberOrderBest'], (r) => {
      if (r.numberOrderBest) {
        this.best = r.numberOrderBest;
        document.getElementById('best').textContent = this.best.toFixed(1) + 's';
      }
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    this.shuffle();
    this.render();
  }
  shuffle() {
    this.numbers = [];
    for (let i = 1; i <= 25; i++) this.numbers.push(i);
    for (let i = this.numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.numbers[i], this.numbers[j]] = [this.numbers[j], this.numbers[i]];
    }
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    this.numbers.forEach((num, idx) => {
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.textContent = num;
      if (num < this.next) btn.classList.add('done');
      btn.addEventListener('click', () => this.tap(num, btn));
      grid.appendChild(btn);
    });
  }
  start() {
    this.shuffle();
    this.next = 1;
    this.started = true;
    this.startTime = Date.now();
    this.render();
    document.getElementById('startBtn').textContent = 'RESTART';
    this.timer = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      document.getElementById('time').textContent = elapsed.toFixed(1);
    }, 100);
  }
  tap(num, btn) {
    if (!this.started) return;
    if (num === this.next) {
      btn.classList.add('done');
      this.next++;
      if (this.next > 25) this.finish();
    } else {
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 300);
    }
  }
  finish() {
    clearInterval(this.timer);
    this.started = false;
    const time = (Date.now() - this.startTime) / 1000;
    document.getElementById('time').textContent = time.toFixed(1);
    if (!this.best || time < this.best) {
      this.best = time;
      chrome.storage.local.set({ numberOrderBest: this.best });
      document.getElementById('best').textContent = this.best.toFixed(1) + 's';
    }
    document.getElementById('startBtn').textContent = 'PLAY AGAIN';
  }
}
document.addEventListener('DOMContentLoaded', () => new NumberOrder());
