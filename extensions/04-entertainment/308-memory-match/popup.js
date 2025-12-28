// Memory Match - Popup Script
class MemoryMatch {
  constructor() {
    this.symbols = ['🍎','🍊','🍋','🍇','🍓','🍒','🥝','🍑'];
    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.locked = false;
    this.init();
  }
  init() {
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.cards = [...this.symbols, ...this.symbols].sort(() => Math.random() - 0.5);
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.locked = false;
    this.render();
  }
  render() {
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('pairs').textContent = this.matched;
    const board = document.getElementById('board');
    board.innerHTML = this.cards.map((s, i) => `<button class="card" data-index="${i}" data-symbol="${s}"></button>`).join('');
    board.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => this.flip(parseInt(card.dataset.index)));
    });
    const winMsg = document.querySelector('.win-message');
    if (winMsg) winMsg.remove();
  }
  flip(index) {
    if (this.locked || this.flipped.includes(index)) return;
    const cards = document.querySelectorAll('.card');
    const card = cards[index];
    if (card.classList.contains('matched')) return;
    card.textContent = this.cards[index];
    card.classList.add('flipped');
    this.flipped.push(index);
    if (this.flipped.length === 2) {
      this.moves++;
      document.getElementById('moves').textContent = this.moves;
      this.checkMatch(cards);
    }
  }
  checkMatch(cards) {
    const [i1, i2] = this.flipped;
    if (this.cards[i1] === this.cards[i2]) {
      cards[i1].classList.add('matched');
      cards[i2].classList.add('matched');
      this.matched++;
      document.getElementById('pairs').textContent = this.matched;
      this.flipped = [];
      if (this.matched === 8) {
        const msg = document.createElement('div');
        msg.className = 'win-message';
        msg.textContent = `You won in ${this.moves} moves!`;
        document.getElementById('board').before(msg);
      }
    } else {
      this.locked = true;
      setTimeout(() => {
        cards[i1].textContent = '';
        cards[i2].textContent = '';
        cards[i1].classList.remove('flipped');
        cards[i2].classList.remove('flipped');
        this.flipped = [];
        this.locked = false;
      }, 800);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new MemoryMatch());
