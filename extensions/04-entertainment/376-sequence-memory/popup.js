// Sequence Memory - Popup Script
class SequenceMemory {
  constructor() {
    this.sequence = [];
    this.playerIdx = 0;
    this.level = 1;
    this.best = 0;
    this.playing = false;
    this.showing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['seqMemBest'], (r) => {
      this.best = r.seqMemBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.querySelectorAll('.tile').forEach(tile => {
      tile.addEventListener('click', () => this.handleClick(parseInt(tile.dataset.idx)));
    });
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
    this.sequence.push(Math.floor(Math.random() * 9));
    this.playerIdx = 0;
    this.showSequence();
  }
  showSequence() {
    this.showing = true;
    this.setTilesEnabled(false);
    document.getElementById('message').textContent = 'Watch...';
    let i = 0;
    const show = () => {
      if (i > 0) {
        document.querySelector(`[data-idx="${this.sequence[i-1]}"]`).classList.remove('active');
      }
      if (i < this.sequence.length) {
        document.querySelector(`[data-idx="${this.sequence[i]}"]`).classList.add('active');
        i++;
        setTimeout(show, 600);
      } else {
        setTimeout(() => {
          document.querySelector(`[data-idx="${this.sequence[i-1]}"]`).classList.remove('active');
          this.showing = false;
          this.setTilesEnabled(true);
          document.getElementById('message').textContent = 'Your turn!';
        }, 400);
      }
    };
    setTimeout(show, 500);
  }
  setTilesEnabled(enabled) {
    document.querySelectorAll('.tile').forEach(t => t.disabled = !enabled);
  }
  handleClick(idx) {
    if (!this.playing || this.showing) return;
    const tile = document.querySelector(`[data-idx="${idx}"]`);
    tile.classList.add('active');
    setTimeout(() => tile.classList.remove('active'), 200);
    if (idx === this.sequence[this.playerIdx]) {
      this.playerIdx++;
      if (this.playerIdx === this.sequence.length) {
        this.level++;
        document.getElementById('level').textContent = this.level;
        if (this.level - 1 > this.best) {
          this.best = this.level - 1;
          document.getElementById('best').textContent = this.best;
          chrome.storage.local.set({ seqMemBest: this.best });
        }
        setTimeout(() => this.addToSequence(), 800);
      }
    } else {
      this.gameOver(tile);
    }
  }
  gameOver(tile) {
    this.playing = false;
    tile.classList.add('wrong');
    document.getElementById('message').textContent = 'Game Over! Level ' + (this.level - 1);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    setTimeout(() => tile.classList.remove('wrong'), 500);
  }
}
document.addEventListener('DOMContentLoaded', () => new SequenceMemory());
