// Word Morph - Popup Script
class WordMorph {
  constructor() {
    this.puzzles = [
      { start: 'CAT', end: 'DOG', path: ['CAT','COT','COG','DOG'] },
      { start: 'HEAD', end: 'TAIL', path: ['HEAD','HEAL','TEAL','TELL','TALL','TAIL'] },
      { start: 'COLD', end: 'WARM', path: ['COLD','CORD','CARD','WARD','WARM'] },
      { start: 'LOVE', end: 'HATE', path: ['LOVE','LIVE','HIVE','HAVE','HATE'] },
      { start: 'SLOW', end: 'FAST', path: ['SLOW','SLOT','SLAT','FLAT','FAST'] }
    ];
    this.current = null;
    this.chain = [];
    this.moves = 0;
    this.score = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['wordMorphScore'], (r) => {
      if (r.wordMorphScore) this.score = r.wordMorphScore;
      this.updateStats();
    });
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.submit();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    this.newPuzzle();
  }
  newPuzzle() {
    this.current = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    this.chain = [this.current.start];
    this.moves = 0;
    document.getElementById('start').textContent = this.current.start;
    document.getElementById('end').textContent = this.current.end;
    document.getElementById('input').value = '';
    document.getElementById('message').textContent = '';
    this.render();
    this.updateStats();
  }
  render() {
    const chainEl = document.getElementById('chain');
    chainEl.innerHTML = '';
    this.chain.forEach(word => {
      const span = document.createElement('span');
      span.className = 'chain-word';
      span.textContent = word;
      chainEl.appendChild(span);
    });
  }
  submit() {
    const input = document.getElementById('input');
    const word = input.value.toUpperCase().trim();
    input.value = '';
    const lastWord = this.chain[this.chain.length - 1];
    if (word.length !== lastWord.length) {
      this.showMessage('Same length required!', false);
      return;
    }
    let diff = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] !== lastWord[i]) diff++;
    }
    if (diff !== 1) {
      this.showMessage('Change exactly one letter!', false);
      return;
    }
    if (this.chain.includes(word)) {
      this.showMessage('Already used!', false);
      return;
    }
    this.chain.push(word);
    this.moves++;
    this.render();
    this.updateStats();
    if (word === this.current.end) {
      const bonus = Math.max(0, 50 - (this.moves - this.current.path.length + 1) * 5);
      this.score += 20 + bonus;
      chrome.storage.local.set({ wordMorphScore: this.score });
      this.showMessage(`Solved! +${20 + bonus} points`, true);
      this.updateStats();
    }
  }
  showMessage(msg, success) {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.className = 'message ' + (success ? 'success' : 'error');
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('moves').textContent = this.moves;
  }
}
document.addEventListener('DOMContentLoaded', () => new WordMorph());
