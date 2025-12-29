// Blackjack - Popup Script
class Blackjack {
  constructor() {
    this.suits = ['♠', '♥', '♦', '♣'];
    this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.wins = 0;
    this.losses = 0;
    this.gameOver = true;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['bjWins', 'bjLosses']);
    this.wins = data.bjWins || 0;
    this.losses = data.bjLosses || 0;
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('losses').textContent = this.losses;
    document.getElementById('dealBtn').addEventListener('click', () => this.deal());
    document.getElementById('hitBtn').addEventListener('click', () => this.hit());
    document.getElementById('standBtn').addEventListener('click', () => this.stand());
  }
  createDeck() {
    this.deck = [];
    for (const suit of this.suits) {
      for (const value of this.values) {
        this.deck.push({ suit, value });
      }
    }
    this.deck.sort(() => Math.random() - 0.5);
  }
  deal() {
    this.createDeck();
    this.playerHand = [this.deck.pop(), this.deck.pop()];
    this.dealerHand = [this.deck.pop(), this.deck.pop()];
    this.gameOver = false;
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = 'result';
    document.getElementById('hitBtn').disabled = false;
    document.getElementById('standBtn').disabled = false;
    this.render(true);
    if (this.calcScore(this.playerHand) === 21) this.stand();
  }
  hit() {
    this.playerHand.push(this.deck.pop());
    this.render(true);
    if (this.calcScore(this.playerHand) > 21) this.endGame('lose', 'Bust! You lose.');
  }
  stand() {
    while (this.calcScore(this.dealerHand) < 17) {
      this.dealerHand.push(this.deck.pop());
    }
    this.render(false);
    const ps = this.calcScore(this.playerHand);
    const ds = this.calcScore(this.dealerHand);
    if (ds > 21) this.endGame('win', 'Dealer busts! You win!');
    else if (ps > ds) this.endGame('win', 'You win!');
    else if (ps < ds) this.endGame('lose', 'Dealer wins.');
    else this.endGame('push', 'Push!');
  }
  calcScore(hand) {
    let score = 0, aces = 0;
    for (const card of hand) {
      if (card.value === 'A') { aces++; score += 11; }
      else if (['K', 'Q', 'J'].includes(card.value)) score += 10;
      else score += parseInt(card.value);
    }
    while (score > 21 && aces > 0) { score -= 10; aces--; }
    return score;
  }
  endGame(result, msg) {
    this.gameOver = true;
    document.getElementById('hitBtn').disabled = true;
    document.getElementById('standBtn').disabled = true;
    document.getElementById('result').textContent = msg;
    document.getElementById('result').className = 'result ' + result;
    if (result === 'win') { this.wins++; chrome.storage.local.set({ bjWins: this.wins }); }
    else if (result === 'lose') { this.losses++; chrome.storage.local.set({ bjLosses: this.losses }); }
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('losses').textContent = this.losses;
    this.render(false);
  }
  render(hideDealer) {
    const renderCard = (card, hidden) => {
      const isRed = ['♥', '♦'].includes(card.suit);
      return `<div class="card ${hidden ? 'hidden' : isRed ? 'red' : 'black'}">${hidden ? '' : card.value + card.suit}</div>`;
    };
    document.getElementById('playerCards').innerHTML = this.playerHand.map(c => renderCard(c, false)).join('');
    document.getElementById('dealerCards').innerHTML = this.dealerHand.map((c, i) => renderCard(c, hideDealer && i === 1)).join('');
    document.getElementById('playerScore').textContent = this.calcScore(this.playerHand);
    document.getElementById('dealerScore').textContent = hideDealer ? '?' : this.calcScore(this.dealerHand);
  }
}
document.addEventListener('DOMContentLoaded', () => new Blackjack());
