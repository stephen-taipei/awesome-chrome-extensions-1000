// Coin Stack - Popup Script
class CoinStack {
  constructor() {
    this.coins = [];
    this.height = 0;
    this.best = 0;
    this.baseWidth = 80;
    this.coinWidth = 32;
    this.playing = true;
    this.init();
  }
  init() {
    chrome.storage.local.get(['coinStackBest'], (r) => {
      this.best = r.coinStackBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('dropBtn').addEventListener('click', () => this.drop());
  }
  drop() {
    if (!this.playing) {
      this.reset();
      return;
    }
    const dropper = document.getElementById('dropper');
    const rect = dropper.getBoundingClientRect();
    const arena = document.getElementById('arena').getBoundingClientRect();
    const dropX = rect.left - arena.left + 16;
    const targetX = 128;
    const tolerance = this.height === 0 ? 40 : Math.max(20, 40 - this.height * 2);
    if (Math.abs(dropX - targetX) <= tolerance) {
      this.addCoin();
    } else {
      this.gameOver();
    }
  }
  addCoin() {
    const stack = document.getElementById('stack');
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.textContent = '🪙';
    stack.appendChild(coin);
    this.height++;
    document.getElementById('height').textContent = this.height;
    if (this.height > this.best) {
      this.best = this.height;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ coinStackBest: this.best });
    }
  }
  gameOver() {
    this.playing = false;
    const coins = document.querySelectorAll('.coin');
    coins.forEach((c, i) => {
      setTimeout(() => c.classList.add('fall'), i * 50);
    });
    document.getElementById('dropBtn').textContent = 'Play Again';
  }
  reset() {
    this.playing = true;
    this.height = 0;
    document.getElementById('height').textContent = '0';
    document.getElementById('stack').innerHTML = '';
    document.getElementById('dropBtn').textContent = 'Drop Coin';
  }
}
document.addEventListener('DOMContentLoaded', () => new CoinStack());
