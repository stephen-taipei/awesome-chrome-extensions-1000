// Math Bingo - Popup Script
class MathBingo {
  constructor() {
    this.card = [];
    this.marked = [];
    this.currentAnswer = 0;
    this.init();
  }
  init() {
    document.getElementById('newBtn').addEventListener('click', () => this.newCard());
    document.getElementById('grid').addEventListener('click', (e) => this.mark(e));
    this.newCard();
  }
  newCard() {
    const nums = [];
    while (nums.length < 24) {
      const n = Math.floor(Math.random() * 50) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    this.card = [];
    this.marked = Array(25).fill(false);
    this.marked[12] = true;
    let idx = 0;
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        this.card.push('FREE');
      } else {
        this.card.push(nums[idx++]);
      }
    }
    document.getElementById('message').textContent = '';
    this.newProblem();
    this.render();
  }
  newProblem() {
    const available = this.card.filter((v, i) => !this.marked[i] && v !== 'FREE');
    if (available.length === 0) return;
    this.currentAnswer = available[Math.floor(Math.random() * available.length)];
    const a = Math.floor(Math.random() * this.currentAnswer);
    const b = this.currentAnswer - a;
    document.getElementById('problem').textContent = `${a} + ${b} = ?`;
  }
  mark(e) {
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    const idx = parseInt(cell.dataset.idx);
    if (this.marked[idx]) return;
    if (this.card[idx] === this.currentAnswer) {
      this.marked[idx] = true;
      this.render();
      if (this.checkBingo()) {
        document.getElementById('message').textContent = '🎉 BINGO!';
      } else {
        this.newProblem();
      }
    }
  }
  checkBingo() {
    const lines = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];
    for (const line of lines) {
      if (line.every(i => this.marked[i])) {
        line.forEach(i => {
          document.querySelector(`[data-idx="${i}"]`).classList.add('bingo');
        });
        return true;
      }
    }
    return false;
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = this.card.map((v, i) => {
      let cls = 'cell';
      if (v === 'FREE') cls += ' free';
      if (this.marked[i]) cls += ' marked';
      return `<button class="${cls}" data-idx="${i}">${v}</button>`;
    }).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new MathBingo());
