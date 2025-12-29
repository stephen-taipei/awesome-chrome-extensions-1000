// Dice Poker - Popup Script
class DicePoker {
  constructor() {
    this.diceVals = [1,1,1,1,1];
    this.held = [false,false,false,false,false];
    this.rolls = 3;
    this.score = 0;
    this.best = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['dicePokerBest'], (r) => {
      if (r.dicePokerBest) this.best = r.dicePokerBest;
      this.updateStats();
    });
    document.getElementById('rollBtn').addEventListener('click', () => this.roll());
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.render();
  }
  newGame() {
    this.diceVals = [1,1,1,1,1];
    this.held = [false,false,false,false,false];
    this.rolls = 3;
    document.getElementById('hand').textContent = '';
    this.render();
  }
  roll() {
    if (this.rolls <= 0) return;
    const diceEl = document.querySelectorAll('.die');
    diceEl.forEach((d, i) => { if (!this.held[i]) d.classList.add('rolling'); });
    setTimeout(() => {
      this.diceVals = this.diceVals.map((v, i) => this.held[i] ? v : Math.floor(Math.random() * 6) + 1);
      this.rolls--;
      this.render();
      if (this.rolls === 0) this.evaluate();
    }, 300);
  }
  render() {
    const container = document.getElementById('dice');
    container.innerHTML = '';
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    this.diceVals.forEach((v, i) => {
      const die = document.createElement('div');
      die.className = 'die' + (this.held[i] ? ' held' : '');
      die.textContent = faces[v - 1];
      die.addEventListener('click', () => this.toggleHold(i));
      container.appendChild(die);
    });
    document.getElementById('rolls').textContent = this.rolls;
    document.getElementById('rollBtn').disabled = this.rolls <= 0;
  }
  toggleHold(i) {
    if (this.rolls === 3 || this.rolls === 0) return;
    this.held[i] = !this.held[i];
    this.render();
  }
  evaluate() {
    const counts = {};
    this.diceVals.forEach(v => counts[v] = (counts[v] || 0) + 1);
    const vals = Object.values(counts).sort((a,b) => b - a);
    const sorted = [...this.diceVals].sort((a,b) => a - b);
    let hand = '', pts = 0;
    const isStraight = sorted.join('') === '12345' || sorted.join('') === '23456';
    if (vals[0] === 5) { hand = 'Five of a Kind!'; pts = 50; }
    else if (vals[0] === 4) { hand = 'Four of a Kind'; pts = 25; }
    else if (vals[0] === 3 && vals[1] === 2) { hand = 'Full House'; pts = 20; }
    else if (isStraight) { hand = 'Straight'; pts = 30; }
    else if (vals[0] === 3) { hand = 'Three of a Kind'; pts = 10; }
    else if (vals[0] === 2 && vals[1] === 2) { hand = 'Two Pairs'; pts = 5; }
    else if (vals[0] === 2) { hand = 'One Pair'; pts = 2; }
    else { hand = 'Nothing'; pts = 0; }
    this.score += pts;
    if (this.score > this.best) {
      this.best = this.score;
      chrome.storage.local.set({ dicePokerBest: this.best });
    }
    document.getElementById('hand').textContent = hand + (pts ? ` +${pts}` : '');
    this.updateStats();
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('best').textContent = this.best;
  }
}
document.addEventListener('DOMContentLoaded', () => new DicePoker());
