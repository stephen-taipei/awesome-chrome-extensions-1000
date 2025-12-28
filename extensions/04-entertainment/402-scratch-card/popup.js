// Scratch Card - Popup Script
class ScratchCard {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.prizes = ['💎 $1000', '⭐ $500', '🎁 $100', '🍀 $50', '❌ Try Again', '❌ Try Again', '❌ Try Again'];
    this.prize = '';
    this.scratched = 0;
    this.revealed = false;
    this.wins = 0;
    this.cards = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['scratchWins', 'scratchCards'], (r) => {
      if (r.scratchWins) this.wins = r.scratchWins;
      if (r.scratchCards) this.cards = r.scratchCards;
      this.updateStats();
    });
    this.newCard();
    this.canvas.addEventListener('mousedown', () => this.scratching = true);
    this.canvas.addEventListener('mouseup', () => this.scratching = false);
    this.canvas.addEventListener('mouseleave', () => this.scratching = false);
    this.canvas.addEventListener('mousemove', (e) => this.scratch(e));
    document.getElementById('newBtn').addEventListener('click', () => this.newCard());
  }
  updateStats() {
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('cards').textContent = this.cards;
  }
  newCard() {
    this.prize = this.prizes[Math.floor(Math.random() * this.prizes.length)];
    this.scratched = 0;
    this.revealed = false;
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = 'result';
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, 0, 240, 160);
    this.ctx.font = 'bold 32px sans-serif';
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.prize, 120, 90);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(0, 0, 240, 160);
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '14px sans-serif';
    this.ctx.fillText('Scratch here!', 120, 85);
    this.cards++;
    chrome.storage.local.set({ scratchCards: this.cards });
    this.updateStats();
  }
  scratch(e) {
    if (!this.scratching || this.revealed) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
    this.checkReveal();
  }
  checkReveal() {
    const data = this.ctx.getImageData(0, 0, 240, 160).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] === 0) clear++;
    const pct = clear / (240 * 160);
    if (pct > 0.5 && !this.revealed) {
      this.revealed = true;
      this.ctx.clearRect(0, 0, 240, 160);
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(0, 0, 240, 160);
      this.ctx.font = 'bold 32px sans-serif';
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.prize, 120, 90);
      if (!this.prize.includes('❌')) {
        this.wins++;
        chrome.storage.local.set({ scratchWins: this.wins });
        this.updateStats();
        document.getElementById('result').textContent = 'YOU WIN!';
        document.getElementById('result').classList.add('win');
      } else {
        document.getElementById('result').textContent = 'Try again!';
        document.getElementById('result').classList.add('lose');
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new ScratchCard());
