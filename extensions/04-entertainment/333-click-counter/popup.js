// Click Counter - Popup Script
class ClickCounter {
  constructor() {
    this.count = 0;
    this.total = 0;
    this.clicks = [];
    this.init();
  }
  init() {
    document.getElementById('clickBtn').addEventListener('click', () => this.click());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    this.loadStats();
  }
  click() {
    this.count++;
    this.total++;
    const now = Date.now();
    this.clicks.push(now);
    this.clicks = this.clicks.filter(t => now - t < 1000);
    this.updateDisplay();
    this.saveStats();
  }
  updateDisplay() {
    document.getElementById('count').textContent = this.count;
    document.getElementById('total').textContent = this.total;
    document.getElementById('cps').textContent = this.clicks.length;
  }
  reset() {
    this.count = 0;
    this.clicks = [];
    this.updateDisplay();
  }
  saveStats() { chrome.storage.local.set({ clickTotal: this.total }); }
  loadStats() {
    chrome.storage.local.get(['clickTotal'], (r) => {
      this.total = r.clickTotal || 0;
      this.updateDisplay();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new ClickCounter());
