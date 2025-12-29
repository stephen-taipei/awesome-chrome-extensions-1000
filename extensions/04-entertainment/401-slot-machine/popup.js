// Slot Machine - Popup Script
class SlotMachine {
  constructor() {
    this.symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣', '💎'];
    this.coins = 100;
    this.spinning = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['slotCoins'], (r) => {
      if (r.slotCoins !== undefined) this.coins = r.slotCoins;
      this.updateDisplay();
    });
    document.getElementById('spinBtn').addEventListener('click', () => this.spin());
  }
  updateDisplay() {
    document.getElementById('coins').textContent = this.coins;
    document.getElementById('spinBtn').disabled = this.coins < 10;
  }
  spin() {
    if (this.spinning || this.coins < 10) return;
    this.spinning = true;
    this.coins -= 10;
    this.updateDisplay();
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = 'result';
    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    reels.forEach(r => r.classList.add('spinning'));
    const results = [];
    reels.forEach((reel, i) => {
      setTimeout(() => {
        reel.classList.remove('spinning');
        const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        reel.textContent = symbol;
        results.push(symbol);
        if (results.length === 3) this.checkWin(results);
      }, 500 + i * 400);
    });
  }
  checkWin(results) {
    let winnings = 0;
    let msg = '';
    if (results[0] === results[1] && results[1] === results[2]) {
      if (results[0] === '💎') { winnings = 500; msg = 'JACKPOT! +500'; }
      else if (results[0] === '7️⃣') { winnings = 200; msg = 'LUCKY 7s! +200'; }
      else { winnings = 100; msg = 'THREE OF A KIND! +100'; }
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      winnings = 20;
      msg = 'PAIR! +20';
    }
    if (winnings > 0) {
      this.coins += winnings;
      document.getElementById('result').textContent = msg;
      document.getElementById('result').classList.add('win');
    } else {
      document.getElementById('result').textContent = 'Try again!';
      document.getElementById('result').classList.add('lose');
    }
    chrome.storage.local.set({ slotCoins: this.coins });
    this.updateDisplay();
    this.spinning = false;
  }
}
document.addEventListener('DOMContentLoaded', () => new SlotMachine());
