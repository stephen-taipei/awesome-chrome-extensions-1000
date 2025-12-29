// Word Chain - Popup Script
class WordChain {
  constructor() {
    this.starters = ['apple','banana','orange','tiger','elephant','garden','music','river','stone','light'];
    this.used = [];
    this.lastWord = '';
    this.chain = 0;
    this.best = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['wordChainBest'], (r) => {
      if (r.wordChainBest) this.best = r.wordChainBest;
      this.updateStats();
    });
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.submit();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.lastWord = this.starters[Math.floor(Math.random() * this.starters.length)];
    this.used = [this.lastWord.toLowerCase()];
    this.chain = 0;
    this.render();
    document.getElementById('input').value = '';
    document.getElementById('message').textContent = '';
  }
  render() {
    document.getElementById('lastWord').textContent = this.lastWord.toUpperCase();
    document.getElementById('letter').textContent = this.lastWord.slice(-1).toUpperCase();
    this.updateStats();
  }
  submit() {
    const input = document.getElementById('input');
    const word = input.value.toLowerCase().trim();
    const msg = document.getElementById('message');
    input.value = '';
    if (word.length < 2) {
      msg.textContent = 'Word too short!';
      msg.className = 'message error';
      return;
    }
    const reqLetter = this.lastWord.slice(-1).toLowerCase();
    if (word[0] !== reqLetter) {
      msg.textContent = `Must start with "${reqLetter.toUpperCase()}"`;
      msg.className = 'message error';
      return;
    }
    if (this.used.includes(word)) {
      msg.textContent = 'Already used!';
      msg.className = 'message error';
      return;
    }
    this.used.push(word);
    this.lastWord = word;
    this.chain++;
    if (this.chain > this.best) {
      this.best = this.chain;
      chrome.storage.local.set({ wordChainBest: this.best });
    }
    msg.textContent = `+1 Chain: ${this.chain}`;
    msg.className = 'message success';
    this.render();
  }
  updateStats() {
    document.getElementById('chain').textContent = this.chain;
    document.getElementById('best').textContent = this.best;
  }
}
document.addEventListener('DOMContentLoaded', () => new WordChain());
