// Number Guess - Popup Script
class NumberGuess {
  constructor() {
    this.secret = 0;
    this.guessCount = 0;
    this.history = [];
    this.best = null;
    this.won = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['numberGuessBest'], (r) => {
      this.best = r.numberGuessBest || null;
      document.getElementById('best').textContent = this.best || '--';
    });
    document.getElementById('guessBtn').addEventListener('click', () => this.guess());
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.guess();
    });
    this.newGame();
  }
  newGame() {
    this.secret = Math.floor(Math.random() * 100) + 1;
    this.guessCount = 0;
    this.history = [];
    this.won = false;
    document.getElementById('guesses').textContent = '0';
    document.getElementById('hint').textContent = 'Enter a number to start';
    document.getElementById('hint').className = 'hint';
    document.getElementById('history').innerHTML = '';
    document.getElementById('input').value = '';
    document.getElementById('input').disabled = false;
    document.getElementById('guessBtn').disabled = false;
    document.getElementById('input').focus();
  }
  guess() {
    if (this.won) return;
    const input = document.getElementById('input');
    const val = parseInt(input.value);
    if (isNaN(val) || val < 1 || val > 100) {
      document.getElementById('hint').textContent = 'Enter 1-100';
      return;
    }
    this.guessCount++;
    document.getElementById('guesses').textContent = this.guessCount;
    input.value = '';
    const hint = document.getElementById('hint');
    if (val === this.secret) {
      this.won = true;
      hint.textContent = '🎉 Correct! ' + this.guessCount + ' guesses';
      hint.className = 'hint correct';
      input.disabled = true;
      document.getElementById('guessBtn').disabled = true;
      if (this.best === null || this.guessCount < this.best) {
        this.best = this.guessCount;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ numberGuessBest: this.best });
      }
    } else if (val < this.secret) {
      hint.textContent = '📈 Higher!';
      hint.className = 'hint higher';
      this.history.push({ val, type: 'low' });
    } else {
      hint.textContent = '📉 Lower!';
      hint.className = 'hint lower';
      this.history.push({ val, type: 'high' });
    }
    this.renderHistory();
  }
  renderHistory() {
    const el = document.getElementById('history');
    el.innerHTML = this.history.map(h => `<span class="guess ${h.type}">${h.val}</span>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new NumberGuess());
