// Digit Span - Popup Script
class DigitSpan {
  constructor() {
    this.sequence = '';
    this.level = 1;
    this.best = 0;
    this.showing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['digitSpanBest'], (r) => {
      this.best = r.digitSpanBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.check();
    });
  }
  start() {
    this.level = 1;
    document.getElementById('level').textContent = '1';
    document.getElementById('message').textContent = '';
    this.nextRound();
  }
  nextRound() {
    this.sequence = '';
    for (let i = 0; i < this.level + 2; i++) {
      this.sequence += Math.floor(Math.random() * 10);
    }
    this.showSequence();
  }
  showSequence() {
    this.showing = true;
    document.getElementById('input').value = '';
    document.getElementById('input').disabled = true;
    document.getElementById('startBtn').disabled = true;
    const display = document.getElementById('display');
    let i = 0;
    display.textContent = '';
    const show = () => {
      if (i < this.sequence.length) {
        display.textContent = this.sequence[i];
        i++;
        setTimeout(() => {
          display.textContent = '';
          setTimeout(show, 200);
        }, 600);
      } else {
        display.textContent = '?';
        this.showing = false;
        document.getElementById('input').disabled = false;
        document.getElementById('input').focus();
      }
    };
    setTimeout(show, 500);
  }
  check() {
    if (this.showing) return;
    const input = document.getElementById('input').value;
    const msg = document.getElementById('message');
    if (input === this.sequence) {
      msg.textContent = '✓ Correct!';
      msg.className = 'message correct';
      this.level++;
      document.getElementById('level').textContent = this.level;
      if (this.level - 1 > this.best) {
        this.best = this.level - 1;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ digitSpanBest: this.best });
      }
      setTimeout(() => {
        msg.textContent = '';
        this.nextRound();
      }, 1000);
    } else {
      msg.textContent = '✗ Was: ' + this.sequence;
      msg.className = 'message wrong';
      document.getElementById('display').textContent = 'Game Over';
      document.getElementById('input').disabled = true;
      document.getElementById('startBtn').disabled = false;
      document.getElementById('startBtn').textContent = 'Play Again';
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new DigitSpan());
