// Color Sequence - Popup Script
class ColorSequence {
  constructor() {
    this.sequence = [];
    this.playerIndex = 0;
    this.round = 0;
    this.best = 0;
    this.playing = false;
    this.showing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorSeqBest'], (r) => {
      this.best = r.colorSeqBest || 0;
      this.updateDisplay();
    });
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => this.playerClick(parseInt(btn.dataset.color)));
      btn.disabled = true;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  start() {
    this.sequence = [];
    this.round = 0;
    this.playing = true;
    this.nextRound();
  }
  nextRound() {
    this.round++;
    this.sequence.push(Math.floor(Math.random() * 4));
    this.playerIndex = 0;
    this.updateDisplay();
    this.setStatus('Watch carefully...');
    this.disableButtons(true);
    this.showSequence();
  }
  showSequence() {
    this.showing = true;
    let i = 0;
    const show = () => {
      if (i < this.sequence.length) {
        this.flash(this.sequence[i]);
        i++;
        setTimeout(show, 600);
      } else {
        this.showing = false;
        this.setStatus('Your turn!');
        this.disableButtons(false);
      }
    };
    setTimeout(show, 500);
  }
  flash(color) {
    const btn = document.querySelector(`[data-color="${color}"]`);
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 300);
  }
  playerClick(color) {
    if (this.showing || !this.playing) return;
    this.flash(color);
    if (color === this.sequence[this.playerIndex]) {
      this.playerIndex++;
      if (this.playerIndex === this.sequence.length) {
        this.setStatus('Correct!');
        this.disableButtons(true);
        setTimeout(() => this.nextRound(), 1000);
      }
    } else {
      this.gameOver();
    }
  }
  gameOver() {
    this.playing = false;
    this.disableButtons(true);
    this.setStatus(`Game Over! Score: ${this.round - 1}`);
    if (this.round - 1 > this.best) {
      this.best = this.round - 1;
      chrome.storage.local.set({ colorSeqBest: this.best });
    }
    this.updateDisplay();
  }
  setStatus(text) {
    document.getElementById('status').textContent = text;
  }
  disableButtons(disabled) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.disabled = disabled);
  }
  updateDisplay() {
    document.getElementById('best').textContent = this.best;
    document.getElementById('round').textContent = this.round;
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorSequence());
