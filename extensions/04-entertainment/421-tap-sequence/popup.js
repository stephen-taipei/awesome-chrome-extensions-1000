// Tap Sequence - Popup Script
class TapSequence {
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
    chrome.storage.local.get(['tapSeqBest'], (r) => {
      if (r.tapSeqBest) this.best = r.tapSeqBest;
      this.updateStats();
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    this.render();
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.addEventListener('click', () => this.tap(i, tile));
      grid.appendChild(tile);
    }
  }
  start() {
    this.sequence = [];
    this.level = 1;
    this.addToSequence();
  }
  addToSequence() {
    this.sequence.push(Math.floor(Math.random() * 9));
    this.playerIdx = 0;
    this.showSequence();
  }
  showSequence() {
    this.showing = true;
    this.playing = false;
    document.getElementById('message').textContent = 'Watch...';
    document.getElementById('message').className = 'message';
    const tiles = document.querySelectorAll('.tile');
    let i = 0;
    const show = () => {
      if (i > 0) tiles[this.sequence[i - 1]].classList.remove('flash');
      if (i < this.sequence.length) {
        tiles[this.sequence[i]].classList.add('flash');
        i++;
        setTimeout(show, 600);
      } else {
        this.showing = false;
        this.playing = true;
        document.getElementById('message').textContent = 'Your turn!';
      }
    };
    setTimeout(show, 500);
  }
  tap(idx, tile) {
    if (!this.playing || this.showing) return;
    if (idx === this.sequence[this.playerIdx]) {
      tile.classList.add('correct');
      setTimeout(() => tile.classList.remove('correct'), 200);
      this.playerIdx++;
      if (this.playerIdx === this.sequence.length) {
        this.level++;
        if (this.level > this.best) {
          this.best = this.level;
          chrome.storage.local.set({ tapSeqBest: this.best });
        }
        this.updateStats();
        document.getElementById('message').textContent = 'Correct!';
        document.getElementById('message').className = 'message success';
        setTimeout(() => this.addToSequence(), 1000);
      }
    } else {
      tile.classList.add('wrong');
      setTimeout(() => tile.classList.remove('wrong'), 500);
      this.playing = false;
      document.getElementById('message').textContent = `Game Over! Level ${this.level}`;
      document.getElementById('message').className = 'message error';
      this.level = 1;
      this.updateStats();
    }
  }
  updateStats() {
    document.getElementById('level').textContent = this.level;
    document.getElementById('best').textContent = this.best;
  }
}
document.addEventListener('DOMContentLoaded', () => new TapSequence());
