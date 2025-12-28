// Color Match - Popup Script
class ColorMatch {
  constructor() {
    this.colors = [
      { name: 'RED', hex: '#ef4444' },
      { name: 'BLUE', hex: '#3b82f6' },
      { name: 'GREEN', hex: '#22c55e' },
      { name: 'YELLOW', hex: '#eab308' },
      { name: 'PURPLE', hex: '#a855f7' },
      { name: 'ORANGE', hex: '#f97316' }
    ];
    this.score = 0;
    this.timeLeft = 30;
    this.timer = null;
    this.currentMatch = false;
    this.playing = false;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('yesBtn').addEventListener('click', () => this.answer(true));
    document.getElementById('noBtn').addEventListener('click', () => this.answer(false));
    this.setButtonsEnabled(false);
  }
  start() {
    this.score = 0;
    this.timeLeft = 30;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('time').textContent = '30';
    this.setButtonsEnabled(true);
    this.newRound();
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('time').textContent = this.timeLeft;
      if (this.timeLeft <= 0) this.end();
    }, 1000);
  }
  newRound() {
    const word = this.colors[Math.floor(Math.random() * this.colors.length)];
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.currentMatch = (word.name === color.name);
    const wordEl = document.getElementById('word');
    wordEl.textContent = word.name;
    wordEl.style.color = color.hex;
  }
  answer(yes) {
    if (!this.playing) return;
    if (yes === this.currentMatch) {
      this.score++;
      document.getElementById('score').textContent = this.score;
    }
    this.newRound();
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    this.setButtonsEnabled(false);
    document.getElementById('word').textContent = `Final: ${this.score}`;
    document.getElementById('word').style.color = '#4ade80';
  }
  setButtonsEnabled(enabled) {
    document.getElementById('yesBtn').disabled = !enabled;
    document.getElementById('noBtn').disabled = !enabled;
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorMatch());
