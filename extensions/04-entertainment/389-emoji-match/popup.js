// Emoji Match - Popup Script
class EmojiMatch {
  constructor() {
    this.emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧'];
    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.best = null;
    this.locked = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['emojiMatchBest'], (r) => {
      this.best = r.emojiMatchBest || null;
      document.getElementById('best').textContent = this.best || '--';
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.cards = [...this.emojis, ...this.emojis].sort(() => Math.random() - 0.5);
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.locked = false;
    document.getElementById('moves').textContent = '0';
    document.getElementById('message').textContent = '';
    this.render();
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = this.cards.map((emoji, i) => {
      return `<button class="card" data-idx="${i}"></button>`;
    }).join('');
    grid.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => this.flip(parseInt(card.dataset.idx)));
    });
  }
  flip(idx) {
    if (this.locked) return;
    const card = document.querySelector(`[data-idx="${idx}"]`);
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    card.textContent = this.cards[idx];
    this.flipped.push(idx);
    if (this.flipped.length === 2) {
      this.moves++;
      document.getElementById('moves').textContent = this.moves;
      this.checkMatch();
    }
  }
  checkMatch() {
    const [a, b] = this.flipped;
    if (this.cards[a] === this.cards[b]) {
      document.querySelector(`[data-idx="${a}"]`).classList.add('matched');
      document.querySelector(`[data-idx="${b}"]`).classList.add('matched');
      this.matched += 2;
      this.flipped = [];
      if (this.matched === this.cards.length) {
        this.win();
      }
    } else {
      this.locked = true;
      setTimeout(() => {
        document.querySelector(`[data-idx="${a}"]`).classList.remove('flipped');
        document.querySelector(`[data-idx="${a}"]`).textContent = '';
        document.querySelector(`[data-idx="${b}"]`).classList.remove('flipped');
        document.querySelector(`[data-idx="${b}"]`).textContent = '';
        this.flipped = [];
        this.locked = false;
      }, 800);
    }
  }
  win() {
    document.getElementById('message').textContent = '🎉 Complete in ' + this.moves + ' moves!';
    if (this.best === null || this.moves < this.best) {
      this.best = this.moves;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ emojiMatchBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new EmojiMatch());
