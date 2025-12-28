// Slot Machine - Popup Script
class SlotMachine {
  constructor() {
    this.symbols = ['🍒','🍋','🍊','🍇','💎','7️⃣'];
    this.coins = 100;
    this.spinning = false;
    this.init();
  }
  init() {
    document.getElementById('spinBtn').addEventListener('click', () => this.spin());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    this.loadCoins();
  }
  spin() {
    if (this.spinning || this.coins < 10) return;
    this.coins -= 10;
    this.updateCoins();
    this.spinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('message').textContent = '';
    const slots = ['slot1','slot2','slot3'].map(id => document.getElementById(id));
    slots.forEach(s => s.classList.add('spinning'));
    const results = [];
    slots.forEach((slot, i) => {
      setTimeout(() => {
        slot.classList.remove('spinning');
        const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        slot.textContent = symbol;
        results.push(symbol);
        if (i === 2) this.checkWin(results);
      }, 500 + i * 300);
    });
  }
  checkWin(results) {
    const msg = document.getElementById('message');
    if (results[0] === results[1] && results[1] === results[2]) {
      const win = results[0] === '7️⃣' ? 100 : results[0] === '💎' ? 50 : 30;
      this.coins += win;
      msg.textContent = `JACKPOT! +${win} coins!`;
      msg.className = 'message win';
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      this.coins += 15;
      msg.textContent = 'Pair! +15 coins!';
      msg.className = 'message win';
    } else {
      msg.textContent = 'No luck!';
      msg.className = 'message lose';
    }
    this.updateCoins();
    this.spinning = false;
    document.getElementById('spinBtn').disabled = this.coins < 10;
  }
  updateCoins() {
    document.getElementById('coins').textContent = this.coins;
    this.saveCoins();
  }
  reset() {
    this.coins = 100;
    this.updateCoins();
    document.getElementById('message').textContent = '';
    document.getElementById('spinBtn').disabled = false;
  }
  saveCoins() { chrome.storage.local.set({ slotCoins: this.coins }); }
  loadCoins() {
    chrome.storage.local.get(['slotCoins'], (r) => {
      if (r.slotCoins !== undefined) {
        this.coins = r.slotCoins;
        this.updateCoins();
        document.getElementById('spinBtn').disabled = this.coins < 10;
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new SlotMachine());
