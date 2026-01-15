// Speed Sort - Popup Script
class SpeedSort {
  constructor() {
    this.items = [];
    this.sorted = [];
    this.ascending = true;
    this.startTime = 0;
    this.timer = null;
    this.best = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['speedSortBest'], (r) => {
      this.best = r.speedSortBest || null;
      document.getElementById('best').textContent = this.best ? this.best.toFixed(1) : '-';
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    clearInterval(this.timer);
    this.ascending = Math.random() > 0.5;
    document.getElementById('orderType').textContent = this.ascending ? 'ascending' : 'descending';
    const useNumbers = Math.random() > 0.3;
    const count = 8;
    if (useNumbers) {
      const nums = [];
      while (nums.length < count) {
        const n = Math.floor(Math.random() * 50) + 1;
        if (!nums.includes(n)) nums.push(n);
      }
      this.items = nums.sort(() => Math.random() - 0.5);
    } else {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const selected = letters.sort(() => Math.random() - 0.5).slice(0, count);
      this.items = selected.sort(() => Math.random() - 0.5);
    }
    this.sorted = [];
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      document.getElementById('timer').textContent = elapsed.toFixed(1);
    }, 100);
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    this.render();
  }
  getExpectedNext() {
    const remaining = [...this.items];
    remaining.sort((a, b) => {
      if (typeof a === 'number') return this.ascending ? a - b : b - a;
      return this.ascending ? a.localeCompare(b) : b.localeCompare(a);
    });
    return remaining[0];
  }
  select(item) {
    const expected = this.getExpectedNext();
    const fb = document.getElementById('feedback');
    if (item === expected) {
      this.items = this.items.filter(i => i !== item);
      this.sorted.push(item);
      this.render();
      if (this.items.length === 0) {
        clearInterval(this.timer);
        const time = (Date.now() - this.startTime) / 1000;
        if (!this.best || time < this.best) {
          this.best = time;
          chrome.storage.local.set({ speedSortBest: this.best });
          document.getElementById('best').textContent = this.best.toFixed(1);
          fb.textContent = `🎉 New record: ${time.toFixed(1)}s!`;
        } else {
          fb.textContent = `✓ Completed in ${time.toFixed(1)}s!`;
        }
        fb.className = 'feedback win';
      }
    } else {
      fb.textContent = `✗ Wrong! Need ${expected}`;
      fb.className = 'feedback wrong';
    }
  }
  render() {
    const itemsEl = document.getElementById('items');
    itemsEl.innerHTML = this.items.map(i => `<div class="item" data-val="${i}">${i}</div>`).join('');
    itemsEl.querySelectorAll('.item').forEach(el => {
      el.addEventListener('click', () => this.select(el.dataset.val.match(/^\d+$/) ? parseInt(el.dataset.val) : el.dataset.val));
    });
    const sortedEl = document.getElementById('sorted');
    sortedEl.innerHTML = this.sorted.map(i => `<div class="sorted-item">${i}</div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new SpeedSort());
