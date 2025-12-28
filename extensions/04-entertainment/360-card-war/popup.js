// Card War - Popup Script
class CardWar {
  constructor() {
    this.suits = ['♠', '♥', '♦', '♣'];
    this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.playerDeck = [];
    this.cpuDeck = [];
    this.pot = [];
    this.gameOver = false;
    this.init();
  }
  init() {
    document.getElementById('playBtn').addEventListener('click', () => this.play());
    this.newGame();
  }
  newGame() {
    const deck = [];
    for (const suit of this.suits) {
      for (const value of this.values) {
        deck.push({ suit, value, rank: this.values.indexOf(value) });
      }
    }
    deck.sort(() => Math.random() - 0.5);
    this.playerDeck = deck.slice(0, 26);
    this.cpuDeck = deck.slice(26);
    this.pot = [];
    this.gameOver = false;
    this.updateCounts();
    document.getElementById('playerCard').textContent = '?';
    document.getElementById('playerCard').className = 'card facedown';
    document.getElementById('cpuCard').textContent = '?';
    document.getElementById('cpuCard').className = 'card facedown';
    document.getElementById('message').textContent = '';
    document.getElementById('playBtn').textContent = 'Draw Card';
    document.getElementById('playBtn').disabled = false;
  }
  play() {
    if (this.gameOver) {
      this.newGame();
      return;
    }
    if (this.playerDeck.length === 0 || this.cpuDeck.length === 0) {
      this.endGame();
      return;
    }
    const pCard = this.playerDeck.shift();
    const cCard = this.cpuDeck.shift();
    this.pot.push(pCard, cCard);
    this.showCard('playerCard', pCard);
    this.showCard('cpuCard', cCard);
    const msg = document.getElementById('message');
    if (pCard.rank > cCard.rank) {
      msg.textContent = 'You win this round!';
      msg.className = 'message win';
      this.playerDeck.push(...this.pot);
      this.pot = [];
    } else if (pCard.rank < cCard.rank) {
      msg.textContent = 'CPU wins this round!';
      msg.className = 'message lose';
      this.cpuDeck.push(...this.pot);
      this.pot = [];
    } else {
      msg.textContent = 'WAR! Draw again!';
      msg.className = 'message tie';
      if (this.playerDeck.length >= 1 && this.cpuDeck.length >= 1) {
        this.pot.push(this.playerDeck.shift(), this.cpuDeck.shift());
      }
    }
    this.updateCounts();
    if (this.playerDeck.length === 0 || this.cpuDeck.length === 0) {
      this.endGame();
    }
  }
  showCard(id, card) {
    const el = document.getElementById(id);
    const isRed = ['♥', '♦'].includes(card.suit);
    el.textContent = card.value + card.suit;
    el.className = 'card ' + (isRed ? 'red' : 'black');
  }
  updateCounts() {
    document.getElementById('playerCount').textContent = this.playerDeck.length;
    document.getElementById('cpuCount').textContent = this.cpuDeck.length;
  }
  endGame() {
    this.gameOver = true;
    const msg = document.getElementById('message');
    if (this.playerDeck.length > this.cpuDeck.length) {
      msg.textContent = '🎉 You WIN the war!';
      msg.className = 'message win';
    } else {
      msg.textContent = 'CPU wins the war!';
      msg.className = 'message lose';
    }
    document.getElementById('playBtn').textContent = 'New Game';
  }
}
document.addEventListener('DOMContentLoaded', () => new CardWar());
