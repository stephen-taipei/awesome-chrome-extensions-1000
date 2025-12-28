// Coin Flip - Popup Script
class CoinFlip {
  constructor() {
    this.heads = 0;
    this.tails = 0;
    this.init();
  }
  init() {
    document.getElementById('flipBtn').addEventListener('click', () => this.flip());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    this.loadStats();
  }
  flip() {
    const coin = document.getElementById('coin');
    const btn = document.getElementById('flipBtn');
    btn.disabled = true;
    coin.className = 'coin flipping';
    setTimeout(() => {
      const isHeads = Math.random() < 0.5;
      if (isHeads) {
        this.heads++;
        coin.textContent = 'H';
        coin.className = 'coin heads';
      } else {
        this.tails++;
        coin.textContent = 'T';
        coin.className = 'coin tails';
      }
      this.updateStats();
      this.saveStats();
      btn.disabled = false;
    }, 500);
  }
  updateStats() {
    document.getElementById('headsCount').textContent = this.heads;
    document.getElementById('tailsCount').textContent = this.tails;
  }
  reset() {
    this.heads = 0;
    this.tails = 0;
    this.updateStats();
    this.saveStats();
    document.getElementById('coin').textContent = '?';
    document.getElementById('coin').className = 'coin';
  }
  saveStats() { chrome.storage.local.set({ coinStats: { heads: this.heads, tails: this.tails } }); }
  loadStats() {
    chrome.storage.local.get(['coinStats'], (r) => {
      if (r.coinStats) {
        this.heads = r.coinStats.heads || 0;
        this.tails = r.coinStats.tails || 0;
        this.updateStats();
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new CoinFlip());
