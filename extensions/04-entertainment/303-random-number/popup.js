// Random Number - Popup Script
class RandomNumber {
  constructor() {
    this.history = [];
    this.init();
  }
  init() {
    document.getElementById('generateBtn').addEventListener('click', () => this.generate());
    this.loadHistory();
  }
  generate() {
    const min = parseInt(document.getElementById('minVal').value) || 0;
    const max = parseInt(document.getElementById('maxVal').value) || 100;
    const count = Math.min(20, Math.max(1, parseInt(document.getElementById('count').value) || 1));
    const numbers = [];
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    document.getElementById('result').innerHTML = `<div class="numbers">${numbers.join(', ')}</div>`;
    this.addToHistory(`[${min}-${max}]: ${numbers.join(', ')}`);
  }
  addToHistory(entry) {
    this.history.unshift(entry);
    if (this.history.length > 10) this.history.pop();
    this.saveHistory();
    this.renderHistory();
  }
  renderHistory() {
    const el = document.getElementById('history');
    if (this.history.length === 0) {
      el.innerHTML = '<div class="history-title">History</div><div class="history-item">No results yet</div>';
    } else {
      el.innerHTML = '<div class="history-title">History</div>' + this.history.map(h => `<div class="history-item">${h}</div>`).join('');
    }
  }
  saveHistory() { chrome.storage.local.set({ randomHistory: this.history }); }
  loadHistory() {
    chrome.storage.local.get(['randomHistory'], (r) => {
      this.history = r.randomHistory || [];
      this.renderHistory();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new RandomNumber());
