// Solitaire - Popup Script
class Solitaire {
  constructor() {
    this.suits = ['♠', '♥', '♦', '♣'];
    this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.stock = []; this.waste = []; this.foundations = [[], [], [], []]; this.tableau = [[], [], [], [], [], [], []];
    this.selected = null; this.moves = 0; this.wins = 0;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['solWins']);
    this.wins = data.solWins || 0;
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    document.getElementById('stock').addEventListener('click', () => this.drawStock());
    document.getElementById('waste').addEventListener('click', () => this.selectWaste());
    for (let i = 0; i < 4; i++) document.getElementById('f' + i).addEventListener('click', () => this.clickFoundation(i));
    this.newGame();
  }
  newGame() {
    const deck = [];
    for (const suit of this.suits) for (const value of this.values) deck.push({ suit, value, faceUp: false });
    deck.sort(() => Math.random() - 0.5);
    this.stock = []; this.waste = []; this.foundations = [[], [], [], []]; this.tableau = [[], [], [], [], [], [], []];
    this.selected = null; this.moves = 0;
    for (let i = 0; i < 7; i++) { for (let j = i; j < 7; j++) this.tableau[j].push(deck.pop()); this.tableau[i][this.tableau[i].length - 1].faceUp = true; }
    this.stock = deck;
    this.render();
  }
  drawStock() {
    if (this.stock.length === 0) { this.stock = this.waste.reverse(); this.waste = []; this.stock.forEach(c => c.faceUp = false); }
    else { const card = this.stock.pop(); card.faceUp = true; this.waste.push(card); this.moves++; }
    this.selected = null; this.render();
  }
  selectWaste() { if (this.waste.length) { this.selected = { from: 'waste' }; this.render(); } }
  clickFoundation(i) {
    if (this.selected) { this.tryMove('foundation', i); }
  }
  tryMove(to, idx) {
    let card;
    if (this.selected.from === 'waste') card = this.waste[this.waste.length - 1];
    if (to === 'foundation') {
      const f = this.foundations[idx];
      const val = this.values.indexOf(card.value);
      if ((f.length === 0 && val === 0) || (f.length > 0 && f[f.length - 1].suit === card.suit && this.values.indexOf(f[f.length - 1].value) === val - 1)) {
        if (this.selected.from === 'waste') this.foundations[idx].push(this.waste.pop());
        this.moves++;
        if (this.foundations.every(f => f.length === 13)) { this.wins++; chrome.storage.local.set({ solWins: this.wins }); alert('You win!'); }
      }
    }
    this.selected = null; this.render();
  }
  render() {
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('stock').innerHTML = this.stock.length ? '<div class="card facedown"></div>' : '';
    document.getElementById('waste').innerHTML = this.waste.length ? this.renderCard(this.waste[this.waste.length - 1], this.selected?.from === 'waste') : '';
    for (let i = 0; i < 4; i++) { const f = this.foundations[i]; document.getElementById('f' + i).innerHTML = f.length ? this.renderCard(f[f.length - 1]) : ''; }
    const tab = document.getElementById('tableau');
    tab.innerHTML = this.tableau.map((col, ci) => `<div class="column">${col.map((c, i) => `<div class="card ${c.faceUp ? (['♥', '♦'].includes(c.suit) ? 'red' : 'black') : 'facedown'}" style="top:${i * 14}px">${c.faceUp ? c.value + c.suit : ''}</div>`).join('')}</div>`).join('');
  }
  renderCard(c, sel = false) { const red = ['♥', '♦'].includes(c.suit); return `<div class="card ${red ? 'red' : 'black'}${sel ? ' selected' : ''}">${c.value}${c.suit}</div>`; }
}
document.addEventListener('DOMContentLoaded', () => new Solitaire());
