// Number Memory - Popup Script
class NumberMemory {
  constructor() {
    this.level = 1;
    this.best = 0;
    this.number = '';
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['numMemBest'], (r) => {
      this.best = r.numMemBest || 0;
      this.updateStats();
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('answer').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.check();
    });
  }
  start() {
    this.playing = true;
    this.generateNumber();
    this.showNumber();
  }
  generateNumber() {
    const digits = this.level + 2;
    this.number = '';
    for (let i = 0; i < digits; i++) {
      this.number += Math.floor(Math.random() * 10);
    }
  }
  showNumber() {
    document.getElementById('display').textContent = this.number;
    document.getElementById('answer').style.display = 'none';
    document.getElementById('answer').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('startBtn').style.display = 'none';
    const showTime = 1000 + this.level * 200;
    setTimeout(() => this.hideNumber(), showTime);
  }
  hideNumber() {
    document.getElementById('display').textContent = '???';
    document.getElementById('answer').style.display = 'block';
    document.getElementById('answer').focus();
  }
  check() {
    const guess = document.getElementById('answer').value;
    if (guess === this.number) {
      this.level++;
      if (this.level + 2 > this.best) {
        this.best = this.level + 2;
        chrome.storage.local.set({ numMemBest: this.best });
      }
      document.getElementById('feedback').textContent = 'Correct!';
      document.getElementById('feedback').className = 'feedback correct';
      this.updateStats();
      setTimeout(() => this.start(), 800);
    } else {
      document.getElementById('feedback').textContent = `Wrong! It was ${this.number}`;
      document.getElementById('feedback').className = 'feedback wrong';
      document.getElementById('display').textContent = 'Game Over';
      document.getElementById('answer').style.display = 'none';
      document.getElementById('startBtn').style.display = 'block';
      document.getElementById('startBtn').textContent = 'TRY AGAIN';
      this.level = 1;
      this.updateStats();
    }
  }
  updateStats() {
    document.getElementById('best').textContent = this.best;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new NumberMemory());
