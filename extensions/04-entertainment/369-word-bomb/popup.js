// Word Bomb - Popup Script
class WordBomb {
  constructor() {
    this.score = 0;
    this.best = 0;
    this.letters = '';
    this.timeLeft = 100;
    this.timer = null;
    this.playing = false;
    this.combos = ['AB', 'ER', 'IN', 'TH', 'AN', 'OU', 'RE', 'ON', 'AT', 'EN', 'ED', 'IT', 'ES', 'OR', 'TE', 'OF', 'TO', 'ND', 'IS', 'AL', 'AR', 'ST', 'NT', 'NG', 'SE', 'HA', 'AS', 'LE', 'VE', 'HE', 'BE', 'WA', 'WI', 'OU', 'SO', 'NO', 'UP', 'DO', 'GO', 'MY', 'IF', 'US', 'AM', 'OW', 'AY', 'EW', 'OO', 'EA', 'AI', 'OA'];
    this.usedWords = new Set();
    this.init();
  }
  init() {
    chrome.storage.local.get(['wordBombBest'], (r) => {
      this.best = r.wordBombBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.submit();
    });
  }
  start() {
    this.score = 0;
    this.timeLeft = 100;
    this.playing = true;
    this.usedWords.clear();
    document.getElementById('score').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    document.getElementById('bomb').textContent = '💣';
    document.getElementById('bomb').className = 'bomb shake';
    document.getElementById('input').value = '';
    document.getElementById('input').focus();
    document.getElementById('startBtn').textContent = 'Playing...';
    document.getElementById('startBtn').disabled = true;
    this.newLetters();
    this.runTimer();
  }
  newLetters() {
    this.letters = this.combos[Math.floor(Math.random() * this.combos.length)];
    document.getElementById('letters').textContent = this.letters;
  }
  runTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft -= 2;
      document.getElementById('timerFill').style.width = this.timeLeft + '%';
      if (this.timeLeft <= 0) {
        this.explode();
      }
    }, 100);
  }
  submit() {
    if (!this.playing) return;
    const input = document.getElementById('input');
    const word = input.value.toUpperCase().trim();
    input.value = '';
    if (word.length < 2) {
      this.showMsg('Too short!', true);
      return;
    }
    if (this.usedWords.has(word)) {
      this.showMsg('Already used!', true);
      return;
    }
    if (!word.includes(this.letters)) {
      this.showMsg('Must contain ' + this.letters, true);
      return;
    }
    this.usedWords.add(word);
    this.score += word.length;
    document.getElementById('score').textContent = this.score;
    this.showMsg('+' + word.length + ' points!', false);
    this.timeLeft = Math.min(100, this.timeLeft + 30);
    document.getElementById('timerFill').style.width = this.timeLeft + '%';
    this.newLetters();
  }
  showMsg(msg, isError) {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.className = 'message' + (isError ? ' error' : '');
  }
  explode() {
    clearInterval(this.timer);
    this.playing = false;
    document.getElementById('bomb').className = 'bomb explode';
    setTimeout(() => {
      document.getElementById('bomb').textContent = '💥';
      document.getElementById('bomb').className = 'bomb';
    }, 300);
    this.showMsg('Game Over! Score: ' + this.score, true);
    document.getElementById('startBtn').textContent = 'Play Again';
    document.getElementById('startBtn').disabled = false;
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ wordBombBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new WordBomb());
