// Color Memory - Popup Script
class ColorMemory {
  constructor() {
    this.colors = ['red', 'blue', 'green', 'yellow'];
    this.sequence = [];
    this.playerIdx = 0;
    this.level = 1;
    this.best = 0;
    this.playing = false;
    this.showing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorMemBest'], (r) => {
      this.best = r.colorMemBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleClick(btn.dataset.color));
    });
    this.setButtonsEnabled(false);
  }
  start() {
    this.sequence = [];
    this.level = 1;
    this.playing = true;
    document.getElementById('level').textContent = '1';
    document.getElementById('startBtn').disabled = true;
    this.addToSequence();
  }
  addToSequence() {
    this.sequence.push(this.colors[Math.floor(Math.random() * 4)]);
    this.playerIdx = 0;
    this.showSequence();
  }
  showSequence() {
    this.showing = true;
    this.setButtonsEnabled(false);
    document.getElementById('message').textContent = 'Watch...';
    let i = 0;
    const show = () => {
      if (i > 0) {
        document.querySelector(`[data-color="${this.sequence[i-1]}"]`).classList.remove('active');
      }
      if (i < this.sequence.length) {
        document.querySelector(`[data-color="${this.sequence[i]}"]`).classList.add('active');
        i++;
        setTimeout(show, 600);
      } else {
        setTimeout(() => {
          document.querySelector(`[data-color="${this.sequence[i-1]}"]`).classList.remove('active');
          this.showing = false;
          this.setButtonsEnabled(true);
          document.getElementById('message').textContent = 'Your turn!';
        }, 400);
      }
    };
    setTimeout(show, 500);
  }
  setButtonsEnabled(enabled) {
    document.querySelectorAll('.color-btn').forEach(b => b.disabled = !enabled);
  }
  handleClick(color) {
    if (!this.playing || this.showing) return;
    const btn = document.querySelector(`[data-color="${color}"]`);
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 200);
    if (color === this.sequence[this.playerIdx]) {
      this.playerIdx++;
      if (this.playerIdx === this.sequence.length) {
        this.level++;
        document.getElementById('level').textContent = this.level;
        if (this.level - 1 > this.best) {
          this.best = this.level - 1;
          document.getElementById('best').textContent = this.best;
          chrome.storage.local.set({ colorMemBest: this.best });
        }
        setTimeout(() => this.addToSequence(), 800);
      }
    } else {
      this.gameOver();
    }
  }
  gameOver() {
    this.playing = false;
    this.setButtonsEnabled(false);
    document.getElementById('message').textContent = 'Game Over! Level ' + (this.level - 1);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorMemory());
