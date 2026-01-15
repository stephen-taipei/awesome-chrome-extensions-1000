// Word Connect - Popup Script
class WordConnect {
  constructor() {
    this.puzzles = [
      { letters: ['C','A','T','S'], words: ['CAT','CATS','SAT','ACT','CAST'] },
      { letters: ['D','O','G','S'], words: ['DOG','DOGS','GOD','GODS','SOD'] },
      { letters: ['R','A','T','E'], words: ['RAT','RATE','EAT','ATE','TEAR','EAR','ARE'] },
      { letters: ['S','T','A','R'], words: ['STAR','RATS','ART','ARTS','SAT','TAR'] },
      { letters: ['L','O','V','E'], words: ['LOVE','VOLE','OLE'] }
    ];
    this.current = null;
    this.selected = [];
    this.found = [];
    this.score = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['wordConnectScore'], (r) => {
      if (r.wordConnectScore) this.score = r.wordConnectScore;
      this.updateStats();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.current = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    this.selected = [];
    this.found = [];
    this.render();
    this.updateStats();
  }
  render() {
    const wordsEl = document.getElementById('words');
    wordsEl.innerHTML = '';
    this.current.words.forEach(word => {
      const slot = document.createElement('div');
      slot.className = 'word-slot' + (this.found.includes(word) ? ' found' : '');
      slot.textContent = this.found.includes(word) ? word : '?'.repeat(word.length);
      wordsEl.appendChild(slot);
    });
    const lettersEl = document.getElementById('letters');
    lettersEl.innerHTML = '';
    this.current.letters.forEach((letter, idx) => {
      const btn = document.createElement('button');
      btn.className = 'letter' + (this.selected.includes(idx) ? ' selected' : '');
      btn.textContent = letter;
      btn.addEventListener('click', () => this.toggle(idx));
      lettersEl.appendChild(btn);
    });
    document.getElementById('current').textContent = this.selected.map(i => this.current.letters[i]).join('');
  }
  toggle(idx) {
    if (this.selected.includes(idx)) {
      this.selected = this.selected.filter(i => i !== idx);
    } else {
      this.selected.push(idx);
    }
    this.render();
    this.checkWord();
  }
  checkWord() {
    const word = this.selected.map(i => this.current.letters[i]).join('');
    if (this.current.words.includes(word) && !this.found.includes(word)) {
      this.found.push(word);
      this.score += word.length * 10;
      chrome.storage.local.set({ wordConnectScore: this.score });
      this.selected = [];
      this.render();
      this.updateStats();
      if (this.found.length === this.current.words.length) {
        setTimeout(() => {
          alert('Puzzle Complete!');
          this.newGame();
        }, 300);
      }
    }
  }
  updateStats() {
    document.getElementById('found').textContent = this.found.length;
    document.getElementById('total').textContent = this.current ? this.current.words.length : 0;
    document.getElementById('score').textContent = this.score;
  }
}
document.addEventListener('DOMContentLoaded', () => new WordConnect());
