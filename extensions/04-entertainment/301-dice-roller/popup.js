// Dice Roller - Popup Script
class DiceRoller {
  constructor() {
    this.history = [];
    this.init();
  }
  init() {
    document.getElementById('rollBtn').addEventListener('click', () => this.roll());
    this.loadHistory();
  }
  roll() {
    const type = parseInt(document.getElementById('diceType').value);
    const count = Math.min(10, Math.max(1, parseInt(document.getElementById('diceCount').value) || 1));
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * type) + 1);
    }
    const total = rolls.reduce((a, b) => a + b, 0);
    document.getElementById('result').innerHTML = `<div class="dice-values">${rolls.join(' + ')}</div><div class="total">${count}d${type} = ${total}</div>`;
    this.addToHistory(`${count}d${type}: [${rolls.join(', ')}] = ${total}`);
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
      el.innerHTML = '<div class="history-title">History</div><div class="history-item">No rolls yet</div>';
    } else {
      el.innerHTML = '<div class="history-title">History</div>' + this.history.map(h => `<div class="history-item">${h}</div>`).join('');
    }
  }
  saveHistory() { chrome.storage.local.set({ diceHistory: this.history }); }
  loadHistory() {
    chrome.storage.local.get(['diceHistory'], (r) => {
      this.history = r.diceHistory || [];
      this.renderHistory();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new DiceRoller());
