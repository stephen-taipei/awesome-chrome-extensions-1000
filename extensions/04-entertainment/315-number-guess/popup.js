// Number Guess - Popup Script
class NumberGuess {
  constructor() {
    this.secret = 0;
    this.attempts = 0;
    this.history = [];
    this.best = null;
    this.init();
  }
  init() {
    document.getElementById('guessBtn').addEventListener('click', () => this.makeGuess());
    document.getElementById('guess').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.makeGuess();
    });
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    this.loadBest();
    this.newGame();
  }
  newGame() {
    this.secret = Math.floor(Math.random() * 100) + 1;
    this.attempts = 0;
    this.history = [];
    document.getElementById('attempts').textContent = '0';
    document.getElementById('hint').textContent = "I'm thinking of a number between 1 and 100";
    document.getElementById('hint').className = 'hint';
    document.getElementById('history').innerHTML = '';
    document.getElementById('guess').value = '';
    document.getElementById('guess').disabled = false;
    document.getElementById('guessBtn').disabled = false;
    document.getElementById('guess').focus();
  }
  makeGuess() {
    const input = document.getElementById('guess');
    const guess = parseInt(input.value);
    if (isNaN(guess) || guess < 1 || guess > 100) return;
    this.attempts++;
    document.getElementById('attempts').textContent = this.attempts;
    const hint = document.getElementById('hint');
    if (guess === this.secret) {
      hint.textContent = `Correct! You got it in ${this.attempts} attempts!`;
      hint.className = 'hint correct';
      this.addHistory(guess, 'correct');
      if (!this.best || this.attempts < this.best) {
        this.best = this.attempts;
        document.getElementById('best').textContent = this.best;
        this.saveBest();
      }
      input.disabled = true;
      document.getElementById('guessBtn').disabled = true;
    } else if (guess < this.secret) {
      hint.textContent = `${guess} is too LOW! Try higher.`;
      hint.className = 'hint higher';
      this.addHistory(guess, 'low');
    } else {
      hint.textContent = `${guess} is too HIGH! Try lower.`;
      hint.className = 'hint lower';
      this.addHistory(guess, 'high');
    }
    input.value = '';
    input.focus();
  }
  addHistory(num, type) {
    this.history.push({ num, type });
    const historyEl = document.getElementById('history');
    historyEl.innerHTML = this.history.map(h => `<div class="history-item ${h.type}">${h.num} - ${h.type === 'low' ? 'Too low' : h.type === 'high' ? 'Too high' : 'Correct!'}</div>`).join('');
    historyEl.scrollTop = historyEl.scrollHeight;
  }
  saveBest() { chrome.storage.local.set({ numberGuessBest: this.best }); }
  loadBest() {
    chrome.storage.local.get(['numberGuessBest'], (r) => {
      if (r.numberGuessBest) {
        this.best = r.numberGuessBest;
        document.getElementById('best').textContent = this.best;
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new NumberGuess());
