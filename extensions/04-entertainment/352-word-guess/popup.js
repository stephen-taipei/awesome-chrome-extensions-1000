// Word Guess - Popup Script
class WordGuess {
  constructor() {
    this.words = ['apple', 'beach', 'crane', 'dance', 'eagle', 'flame', 'grape', 'house', 'island', 'juice', 'knife', 'lemon', 'magic', 'night', 'ocean', 'piano', 'queen', 'river', 'storm', 'tiger', 'uncle', 'vivid', 'water', 'youth', 'zebra', 'brain', 'chair', 'dream', 'earth', 'frost', 'ghost', 'heart', 'image', 'joint', 'kings', 'light', 'money', 'north', 'orbit', 'peace', 'quiet', 'radio', 'space', 'train', 'unity', 'voice', 'world', 'extra', 'young', 'zones'];
    this.target = '';
    this.guesses = [];
    this.current = '';
    this.row = 0;
    this.gameOver = false;
    this.wins = 0;
    this.streak = 0;
    this.keyStates = {};
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['wgWins', 'wgStreak']);
    this.wins = data.wgWins || 0;
    this.streak = data.wgStreak || 0;
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('streak').textContent = this.streak;
    this.renderKeyboard();
    document.addEventListener('keydown', (e) => this.handleKey(e.key));
    this.newGame();
  }
  newGame() {
    this.target = this.words[Math.floor(Math.random() * this.words.length)];
    this.guesses = [];
    this.current = '';
    this.row = 0;
    this.gameOver = false;
    this.keyStates = {};
    document.getElementById('message').textContent = '';
    this.renderGrid();
    this.renderKeyboard();
  }
  handleKey(key) {
    if (this.gameOver) { if (key === 'Enter') this.newGame(); return; }
    if (key === 'Enter') this.submit();
    else if (key === 'Backspace') { this.current = this.current.slice(0, -1); this.renderGrid(); }
    else if (/^[a-zA-Z]$/.test(key) && this.current.length < 5) { this.current += key.toLowerCase(); this.renderGrid(); }
  }
  submit() {
    if (this.current.length !== 5) return;
    const guess = this.current;
    this.guesses.push(guess);
    this.updateKeyStates(guess);
    this.current = '';
    this.row++;
    this.renderGrid();
    this.renderKeyboard();
    if (guess === this.target) {
      this.wins++; this.streak++;
      chrome.storage.local.set({ wgWins: this.wins, wgStreak: this.streak });
      document.getElementById('wins').textContent = this.wins;
      document.getElementById('streak').textContent = this.streak;
      document.getElementById('message').textContent = '🎉 You got it!';
      this.gameOver = true;
    } else if (this.row >= 6) {
      this.streak = 0;
      chrome.storage.local.set({ wgStreak: 0 });
      document.getElementById('streak').textContent = 0;
      document.getElementById('message').textContent = `The word was: ${this.target.toUpperCase()}`;
      this.gameOver = true;
    }
  }
  updateKeyStates(guess) {
    for (let i = 0; i < 5; i++) {
      const letter = guess[i];
      if (this.target[i] === letter) this.keyStates[letter] = 'correct';
      else if (this.target.includes(letter) && this.keyStates[letter] !== 'correct') this.keyStates[letter] = 'present';
      else if (!this.keyStates[letter]) this.keyStates[letter] = 'absent';
    }
  }
  getLetterState(guess, i) {
    if (this.target[i] === guess[i]) return 'correct';
    if (this.target.includes(guess[i])) return 'present';
    return 'absent';
  }
  renderGrid() {
    let html = '';
    for (let r = 0; r < 6; r++) {
      html += '<div class="row">';
      for (let c = 0; c < 5; c++) {
        let letter = '', cls = 'cell';
        if (r < this.guesses.length) { letter = this.guesses[r][c]; cls += ' ' + this.getLetterState(this.guesses[r], c); }
        else if (r === this.row && c < this.current.length) { letter = this.current[c]; cls += ' filled'; }
        html += `<div class="${cls}">${letter}</div>`;
      }
      html += '</div>';
    }
    document.getElementById('grid').innerHTML = html;
  }
  renderKeyboard() {
    const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    let html = '';
    rows.forEach((row, i) => {
      html += '<div class="kb-row">';
      if (i === 2) html += '<button class="key wide" data-key="Enter">ENTER</button>';
      for (const k of row) html += `<button class="key ${this.keyStates[k] || ''}" data-key="${k}">${k.toUpperCase()}</button>`;
      if (i === 2) html += '<button class="key wide" data-key="Backspace">⌫</button>';
      html += '</div>';
    });
    document.getElementById('keyboard').innerHTML = html;
    document.querySelectorAll('.key').forEach(btn => btn.addEventListener('click', () => this.handleKey(btn.dataset.key)));
  }
}
document.addEventListener('DOMContentLoaded', () => new WordGuess());
