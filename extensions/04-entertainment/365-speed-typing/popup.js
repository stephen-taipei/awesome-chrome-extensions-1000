// Speed Typing - Popup Script
class SpeedTyping {
  constructor() {
    this.words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'hello', 'world', 'keyboard', 'typing', 'speed', 'test', 'practice', 'improve', 'skill', 'fast', 'accurate', 'challenge', 'game', 'play', 'score', 'best', 'time', 'word', 'letter', 'type', 'enter', 'correct', 'wrong', 'again', 'start', 'finish', 'winner', 'champion', 'master', 'expert', 'beginner', 'level'];
    this.currentWord = '';
    this.wordsTyped = 0;
    this.time = 30;
    this.wpm = 0;
    this.best = 0;
    this.gameRunning = false;
    this.interval = null;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['typingBest']);
    this.best = data.typingBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('input').addEventListener('input', () => this.check());
    document.getElementById('input').addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.submit();
      }
    });
  }
  start() {
    this.wordsTyped = 0;
    this.time = 30;
    this.wpm = 0;
    this.gameRunning = true;
    document.getElementById('wpm').textContent = 0;
    document.getElementById('words').textContent = 0;
    document.getElementById('timer').textContent = 30;
    document.getElementById('input').value = '';
    document.getElementById('input').disabled = false;
    document.getElementById('input').focus();
    document.getElementById('startBtn').style.display = 'none';
    this.nextWord();
    this.interval = setInterval(() => {
      this.time--;
      document.getElementById('timer').textContent = this.time;
      this.wpm = Math.round((this.wordsTyped / (30 - this.time)) * 60) || 0;
      document.getElementById('wpm').textContent = this.wpm;
      if (this.time <= 0) this.gameOver();
    }, 1000);
  }
  nextWord() {
    this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
    document.getElementById('display').textContent = this.currentWord;
    document.getElementById('input').value = '';
    document.getElementById('input').className = '';
  }
  check() {
    const input = document.getElementById('input').value;
    const inputEl = document.getElementById('input');
    if (this.currentWord.startsWith(input)) {
      inputEl.className = input.length > 0 ? 'correct' : '';
    } else {
      inputEl.className = 'wrong';
    }
  }
  submit() {
    if (!this.gameRunning) return;
    const input = document.getElementById('input').value;
    if (input === this.currentWord) {
      this.wordsTyped++;
      document.getElementById('words').textContent = this.wordsTyped;
      this.nextWord();
    }
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    document.getElementById('input').disabled = true;
    this.wpm = Math.round((this.wordsTyped / 30) * 60);
    document.getElementById('wpm').textContent = this.wpm;
    if (this.wpm > this.best) {
      this.best = this.wpm;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ typingBest: this.best });
    }
    document.getElementById('display').textContent = `Done! ${this.wpm} WPM`;
    document.getElementById('startBtn').textContent = 'Play Again';
    document.getElementById('startBtn').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new SpeedTyping());
