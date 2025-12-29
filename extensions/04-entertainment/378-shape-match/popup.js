// Shape Match - Popup Script
class ShapeMatch {
  constructor() {
    this.shapes = ['●', '■', '▲', '◆', '★', '♥', '⬟', '⬢'];
    this.score = 0;
    this.best = 0;
    this.timeLeft = 100;
    this.timer = null;
    this.playing = false;
    this.isMatch = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['shapeMatchBest'], (r) => {
      this.best = r.shapeMatchBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('yesBtn').addEventListener('click', () => this.answer(true));
    document.getElementById('noBtn').addEventListener('click', () => this.answer(false));
    this.setButtonsEnabled(false);
  }
  start() {
    this.score = 0;
    this.timeLeft = 100;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    document.getElementById('startBtn').disabled = true;
    this.setButtonsEnabled(true);
    this.newRound();
    this.runTimer();
  }
  newRound() {
    const s1 = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    this.isMatch = Math.random() > 0.5;
    const s2 = this.isMatch ? s1 : this.shapes.filter(s => s !== s1)[Math.floor(Math.random() * (this.shapes.length - 1))];
    document.getElementById('shape1').textContent = s1;
    document.getElementById('shape2').textContent = s2;
  }
  answer(yes) {
    if (!this.playing) return;
    const correct = yes === this.isMatch;
    const msg = document.getElementById('message');
    if (correct) {
      this.score++;
      document.getElementById('score').textContent = this.score;
      this.timeLeft = Math.min(100, this.timeLeft + 5);
      msg.textContent = '+1';
      msg.className = 'message correct';
    } else {
      this.timeLeft -= 15;
      msg.textContent = 'Wrong!';
      msg.className = 'message wrong';
    }
    this.newRound();
  }
  setButtonsEnabled(enabled) {
    document.getElementById('yesBtn').disabled = !enabled;
    document.getElementById('noBtn').disabled = !enabled;
  }
  runTimer() {
    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      document.getElementById('timerFill').style.width = Math.max(0, this.timeLeft) + '%';
      if (this.timeLeft <= 0) this.end();
    }, 300);
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    this.setButtonsEnabled(false);
    document.getElementById('shape1').textContent = '';
    document.getElementById('shape2').textContent = '';
    document.getElementById('message').textContent = 'Final Score: ' + this.score;
    document.getElementById('message').className = 'message';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ shapeMatchBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new ShapeMatch());
