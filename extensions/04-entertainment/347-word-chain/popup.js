// Word Chain - Popup Script
class WordChain {
  constructor() {
    this.validWords = new Set(['apple', 'elephant', 'tiger', 'rabbit', 'turtle', 'eagle', 'eel', 'lion', 'newt', 'toad', 'dog', 'giraffe', 'echidna', 'ant', 'table', 'earth', 'hammer', 'rain', 'night', 'tree', 'egg', 'green', 'north', 'house', 'east', 'time', 'ember', 'river', 'robot', 'tunnel', 'lamp', 'paper', 'road', 'drum', 'moon', 'nest', 'tower', 'rope', 'engine', 'energy', 'yellow', 'water', 'ring', 'gate', 'echo', 'orange', 'empire', 'enter', 'royal', 'lemon', 'note', 'extra', 'atom', 'magic', 'cream', 'marble', 'escape', 'escape', 'eleven', 'needle', 'example', 'enough', 'heaven']);
    this.usedWords = new Set();
    this.chain = [];
    this.chainCount = 0;
    this.best = 0;
    this.currentLetter = '';
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['wordChainBest']);
    this.best = data.wordChainBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    document.getElementById('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submit();
    });
    this.newGame();
  }
  newGame() {
    this.usedWords.clear();
    this.chain = [];
    this.chainCount = 0;
    const letters = 'abcdefghilmnoprstw';
    this.currentLetter = letters[Math.floor(Math.random() * letters.length)];
    document.getElementById('chain').textContent = 0;
    document.getElementById('startLetter').textContent = this.currentLetter.toUpperCase();
    document.getElementById('chainDisplay').innerHTML = '';
    document.getElementById('input').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('input').focus();
  }
  submit() {
    const input = document.getElementById('input').value.trim().toLowerCase();
    const feedback = document.getElementById('feedback');
    if (!input) return;
    if (input[0] !== this.currentLetter) {
      feedback.textContent = `Word must start with "${this.currentLetter.toUpperCase()}"`;
      feedback.className = 'feedback error';
      return;
    }
    if (input.length < 3) {
      feedback.textContent = 'Word must be at least 3 letters';
      feedback.className = 'feedback error';
      return;
    }
    if (this.usedWords.has(input)) {
      feedback.textContent = 'Word already used!';
      feedback.className = 'feedback error';
      return;
    }
    this.usedWords.add(input);
    this.chain.push(input);
    this.chainCount++;
    this.currentLetter = input[input.length - 1];
    document.getElementById('chain').textContent = this.chainCount;
    document.getElementById('startLetter').textContent = this.currentLetter.toUpperCase();
    const tag = document.createElement('span');
    tag.className = 'word-tag';
    tag.textContent = input;
    document.getElementById('chainDisplay').appendChild(tag);
    if (this.chainCount > this.best) {
      this.best = this.chainCount;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ wordChainBest: this.best });
    }
    feedback.textContent = 'Great!';
    feedback.className = 'feedback success';
    document.getElementById('input').value = '';
  }
}
document.addEventListener('DOMContentLoaded', () => new WordChain());
