// Card Flip - Popup Script
class CardFlip {
  constructor() {
    this.emojis = ['🎁', '⭐', '💎', '🎯', '🏆', '🎲', '🌟', '💰'];
    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.best = null;
    this.locked = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['cardFlipBest'], (r) => {
      if (r.cardFlipBest) {
        this.best = r.cardFlipBest;
        document.getElementById('best').textContent = this.best;
      }
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.cards = [...this.emojis, ...this.emojis];
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.locked = false;
    this.render();
    this.updateStats();
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    this.cards.forEach((emoji, idx) => {
      const card = document.createElement('button');
      card.className = 'card';
      card.innerHTML = `<span class="front">${emoji}</span><span class="back">?</span>`;
      card.addEventListener('click', () => this.flip(idx, card));
      grid.appendChild(card);
    });
  }
  flip(idx, card) {
    if (this.locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    this.flipped.push({ idx, card, emoji: this.cards[idx] });
    if (this.flipped.length === 2) {
      this.moves++;
      this.updateStats();
      this.checkMatch();
    }
  }
  checkMatch() {
    this.locked = true;
    const [first, second] = this.flipped;
    if (first.emoji === second.emoji) {
      first.card.classList.add('matched');
      second.card.classList.add('matched');
      this.matched += 2;
      this.flipped = [];
      this.locked = false;
      if (this.matched === this.cards.length) this.handleWin();
    } else {
      setTimeout(() => {
        first.card.classList.remove('flipped');
        second.card.classList.remove('flipped');
        this.flipped = [];
        this.locked = false;
      }, 800);
    }
  }
  handleWin() {
    if (!this.best || this.moves < this.best) {
      this.best = this.moves;
      chrome.storage.local.set({ cardFlipBest: this.best });
    }
    this.updateStats();
    setTimeout(() => alert(`You won in ${this.moves} moves!`), 100);
  }
  updateStats() {
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('best').textContent = this.best || '-';
  }
}
document.addEventListener('DOMContentLoaded', () => new CardFlip());
