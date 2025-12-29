// Pattern Lock - Popup Script
class PatternLock {
  constructor() {
    this.pattern = [];
    this.playerPattern = [];
    this.level = 1;
    this.best = 0;
    this.showing = false;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['patternBest'], (r) => {
      this.best = r.patternBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    this.renderGrid();
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.dataset.idx = i;
      dot.addEventListener('click', () => this.selectDot(i));
      grid.appendChild(dot);
    }
  }
  start() {
    this.pattern = [];
    this.level = 1;
    this.playing = true;
    document.getElementById('level').textContent = '1';
    document.getElementById('startBtn').disabled = true;
    this.addToPattern();
  }
  addToPattern() {
    this.pattern.push(Math.floor(Math.random() * 9));
    this.playerPattern = [];
    this.showPattern();
  }
  showPattern() {
    this.showing = true;
    document.getElementById('message').textContent = 'Watch...';
    this.setDotsEnabled(false);
    let i = 0;
    const show = () => {
      if (i > 0) {
        document.querySelector(`[data-idx="${this.pattern[i-1]}"]`).classList.remove('active');
      }
      if (i < this.pattern.length) {
        document.querySelector(`[data-idx="${this.pattern[i]}"]`).classList.add('active');
        i++;
        setTimeout(show, 500);
      } else {
        setTimeout(() => {
          document.querySelector(`[data-idx="${this.pattern[i-1]}"]`).classList.remove('active');
          this.showing = false;
          this.setDotsEnabled(true);
          document.getElementById('message').textContent = 'Your turn!';
        }, 400);
      }
    };
    setTimeout(show, 500);
  }
  setDotsEnabled(enabled) {
    document.querySelectorAll('.dot').forEach(d => d.style.pointerEvents = enabled ? 'auto' : 'none');
  }
  selectDot(idx) {
    if (this.showing || !this.playing) return;
    const dot = document.querySelector(`[data-idx="${idx}"]`);
    dot.classList.add('selected');
    setTimeout(() => dot.classList.remove('selected'), 200);
    this.playerPattern.push(idx);
    const pos = this.playerPattern.length - 1;
    if (this.pattern[pos] !== idx) {
      this.gameOver(dot);
      return;
    }
    if (this.playerPattern.length === this.pattern.length) {
      this.level++;
      document.getElementById('level').textContent = this.level;
      if (this.level - 1 > this.best) {
        this.best = this.level - 1;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ patternBest: this.best });
      }
      setTimeout(() => this.addToPattern(), 800);
    }
  }
  gameOver(dot) {
    this.playing = false;
    dot.classList.add('wrong');
    setTimeout(() => dot.classList.remove('wrong'), 500);
    document.getElementById('message').textContent = 'Game Over! Level ' + (this.level - 1);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
  }
}
document.addEventListener('DOMContentLoaded', () => new PatternLock());
