// Hangman - Popup Script
class Hangman {
  constructor() {
    this.words = ['JAVASCRIPT','PYTHON','CHROME','EXTENSION','BROWSER','CODING','DEVELOPER','FUNCTION','VARIABLE','ARRAY','OBJECT','STRING','NUMBER','BOOLEAN','REACT','ANGULAR','NODEJS','DATABASE','ALGORITHM','INTERFACE'];
    this.word = '';
    this.guessed = [];
    this.wrongGuesses = 0;
    this.maxWrong = 6;
    this.init();
  }
  init() {
    document.getElementById('newGame').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.word = this.words[Math.floor(Math.random() * this.words.length)];
    this.guessed = [];
    this.wrongGuesses = 0;
    this.renderKeyboard();
    this.updateDisplay();
  }
  renderKeyboard() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    document.getElementById('keyboard').innerHTML = letters.map(l => `<button class="key" data-letter="${l}">${l}</button>`).join('');
    document.querySelectorAll('.key').forEach(key => {
      key.addEventListener('click', () => this.guess(key.dataset.letter));
    });
  }
  guess(letter) {
    if (this.guessed.includes(letter) || this.wrongGuesses >= this.maxWrong) return;
    this.guessed.push(letter);
    const key = document.querySelector(`[data-letter="${letter}"]`);
    if (this.word.includes(letter)) {
      key.classList.add('correct');
    } else {
      key.classList.add('wrong');
      this.wrongGuesses++;
    }
    key.classList.add('used');
    this.updateDisplay();
  }
  updateDisplay() {
    const display = this.word.split('').map(l => this.guessed.includes(l) ? l : '_').join(' ');
    const wordEl = document.getElementById('word');
    const statusEl = document.getElementById('status');
    wordEl.textContent = display;
    document.getElementById('guessed').textContent = this.guessed.length > 0 ? `Tried: ${this.guessed.join(', ')}` : '';
    statusEl.textContent = `Guesses left: ${this.maxWrong - this.wrongGuesses}`;
    statusEl.className = 'status' + (this.wrongGuesses >= 4 ? ' danger' : '');
    if (!display.includes('_')) {
      wordEl.innerHTML = `<div class="message win">You won!</div><div>${this.word}</div>`;
      this.disableKeys();
    } else if (this.wrongGuesses >= this.maxWrong) {
      wordEl.innerHTML = `<div class="message lose">Game Over!</div><div>Word: ${this.word}</div>`;
      this.disableKeys();
    }
  }
  disableKeys() {
    document.querySelectorAll('.key').forEach(k => k.classList.add('used'));
  }
}
document.addEventListener('DOMContentLoaded', () => new Hangman());
