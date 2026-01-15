// Math Squares - Popup Script
class MathSquares {
  constructor() {
    this.level = 1;
    this.solved = 0;
    this.puzzle = [];
    this.answers = [];
    this.placed = {};
    this.selected = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['mathSqLevel', 'mathSqSolved'], (r) => {
      this.level = r.mathSqLevel || 1;
      this.solved = r.mathSqSolved || 0;
      this.generate();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.generate());
  }
  generate() {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const c = a + b;
    const d = Math.floor(Math.random() * 5) + 1;
    const e = Math.floor(Math.random() * 5) + 1;
    const f = d + e;
    const g = a + d;
    const h = b + e;
    const i = c + f;
    this.puzzle = [
      a, '+', b, '=', c,
      '+', '', '+', '', '+',
      d, '+', e, '=', f,
      '=', '', '=', '', '=',
      g, '+', h, '=', i
    ];
    const nums = [a, b, c, d, e, f, g, h, i];
    const hideCount = Math.min(3 + this.level, 6);
    const hideIndices = [];
    const validIndices = [0, 2, 4, 10, 12, 14, 20, 22, 24];
    while (hideIndices.length < hideCount) {
      const idx = validIndices[Math.floor(Math.random() * validIndices.length)];
      if (!hideIndices.includes(idx)) hideIndices.push(idx);
    }
    this.answers = hideIndices.map(idx => ({ idx, val: this.puzzle[idx] }));
    hideIndices.forEach(idx => this.puzzle[idx] = null);
    this.placed = {};
    this.selected = null;
    this.render();
    this.updateStats();
  }
  render() {
    const puzzleEl = document.getElementById('puzzle');
    puzzleEl.innerHTML = '';
    this.puzzle.forEach((cell, idx) => {
      const div = document.createElement('div');
      if (cell === null) {
        div.className = 'cell number empty' + (this.selected === idx ? ' selected' : '');
        div.textContent = this.placed[idx] || '';
        if (this.placed[idx]) div.classList.add('filled');
        div.addEventListener('click', () => this.selectCell(idx));
      } else if (typeof cell === 'number') {
        div.className = 'cell number fixed';
        div.textContent = cell;
      } else {
        div.className = 'cell op';
        div.textContent = cell;
      }
      puzzleEl.appendChild(div);
    });
    const numbersEl = document.getElementById('numbers');
    numbersEl.innerHTML = '';
    const needed = this.answers.map(a => a.val);
    needed.sort((a, b) => a - b).forEach(num => {
      const btn = document.createElement('button');
      btn.className = 'num-btn';
      const usedCount = Object.values(this.placed).filter(v => v === num).length;
      const neededCount = needed.filter(n => n === num).length;
      if (usedCount >= neededCount) btn.classList.add('used');
      btn.textContent = num;
      btn.addEventListener('click', () => this.placeNumber(num));
      numbersEl.appendChild(btn);
    });
  }
  selectCell(idx) {
    this.selected = this.selected === idx ? null : idx;
    this.render();
  }
  placeNumber(num) {
    if (this.selected === null) return;
    this.placed[this.selected] = num;
    this.selected = null;
    this.render();
    this.checkWin();
  }
  checkWin() {
    const correct = this.answers.every(a => this.placed[a.idx] === a.val);
    if (correct) {
      this.solved++;
      this.level = Math.min(this.level + 1, 10);
      chrome.storage.local.set({ mathSqLevel: this.level, mathSqSolved: this.solved });
      setTimeout(() => { alert('Correct!'); this.generate(); }, 100);
    }
  }
  updateStats() {
    document.getElementById('level').textContent = this.level;
    document.getElementById('solved').textContent = this.solved;
  }
}
document.addEventListener('DOMContentLoaded', () => new MathSquares());
