// Logic Chain - Popup Script
class LogicChain {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.answer = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['logicChainScore', 'logicChainLevel'], (r) => {
      this.score = r.logicChainScore || 0;
      this.level = r.logicChainLevel || 1;
      this.updateStats();
    });
    this.newPuzzle();
  }
  newPuzzle() {
    const patterns = [
      { seq: (n) => n * 2, name: 'double' },
      { seq: (n) => n + 3, name: 'add3' },
      { seq: (n) => n + 5, name: 'add5' },
      { seq: (n) => n * 3, name: 'triple' },
      { seq: (n) => n + n, name: 'sum' },
      { seq: (n, i) => (i + 1) * (i + 1), name: 'square' },
      { seq: (n, i) => [2, 3, 5, 7, 11, 13, 17][i] || n + 2, name: 'prime' },
      { seq: (n, i) => [1, 1, 2, 3, 5, 8, 13][i] || n, name: 'fib' }
    ];
    const pattern = patterns[Math.floor(Math.random() * Math.min(patterns.length, 2 + this.level))];
    const start = Math.floor(Math.random() * 5) + 1;
    const sequence = [];
    let val = start;
    for (let i = 0; i < 4; i++) {
      if (pattern.name === 'square' || pattern.name === 'prime' || pattern.name === 'fib') {
        val = pattern.seq(val, i);
      } else {
        if (i > 0) val = pattern.seq(sequence[i - 1]);
        else val = start;
      }
      sequence.push(val);
    }
    this.answer = pattern.name === 'square' || pattern.name === 'prime' || pattern.name === 'fib'
      ? pattern.seq(val, 4)
      : pattern.seq(sequence[3]);
    this.renderSequence(sequence);
    this.renderOptions();
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  renderSequence(seq) {
    const el = document.getElementById('sequence');
    el.innerHTML = seq.map(n => `<div class="seq-item">${n}</div>`).join('') + '<div class="seq-item mystery">?</div>';
  }
  renderOptions() {
    const options = [this.answer];
    while (options.length < 4) {
      const fake = this.answer + Math.floor(Math.random() * 10) - 5;
      if (fake !== this.answer && fake > 0 && !options.includes(fake)) options.push(fake);
    }
    options.sort(() => Math.random() - 0.5);
    const el = document.getElementById('options');
    el.innerHTML = options.map(o => `<div class="option" data-val="${o}">${o}</div>`).join('');
    el.querySelectorAll('.option').forEach(btn => btn.addEventListener('click', (e) => this.check(parseInt(e.target.dataset.val))));
  }
  check(val) {
    const fb = document.getElementById('feedback');
    if (val === this.answer) {
      this.score += 10 * this.level;
      this.level = Math.min(this.level + 1, 10);
      chrome.storage.local.set({ logicChainScore: this.score, logicChainLevel: this.level });
      fb.textContent = '✓ Correct!';
      fb.className = 'feedback correct';
      this.updateStats();
      setTimeout(() => this.newPuzzle(), 800);
    } else {
      fb.textContent = '✗ Try again!';
      fb.className = 'feedback wrong';
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new LogicChain());
