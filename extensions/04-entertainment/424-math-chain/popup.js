// Math Chain - Popup Script
class MathChain {
  constructor() {
    this.target = 0;
    this.current = 0;
    this.chain = [];
    this.level = 1;
    this.score = 0;
    this.pendingOp = null;
    this.init();
  }
  init() {
    chrome.storage.local.get(['mathChainScore', 'mathChainLevel'], (r) => {
      if (r.mathChainScore) this.score = r.mathChainScore;
      if (r.mathChainLevel) this.level = r.mathChainLevel;
      this.updateStats();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    this.newPuzzle();
  }
  newPuzzle() {
    this.current = Math.floor(Math.random() * 5) + 1;
    this.target = this.current;
    const ops = ['+', '-', '×'];
    for (let i = 0; i < 2 + Math.floor(this.level / 2); i++) {
      const op = ops[Math.floor(Math.random() * ops.length)];
      const num = Math.floor(Math.random() * 9) + 1;
      if (op === '+') this.target += num;
      else if (op === '-') this.target -= num;
      else this.target *= num;
    }
    this.chain = [{ type: 'num', val: this.current }];
    this.pendingOp = null;
    document.getElementById('target').textContent = this.target;
    document.getElementById('message').textContent = '';
    this.render();
    this.renderOps();
  }
  render() {
    const chainEl = document.getElementById('chain');
    chainEl.innerHTML = '';
    this.chain.forEach(item => {
      const span = document.createElement('span');
      span.className = 'chain-item ' + (item.type === 'num' ? 'chain-num' : 'chain-op');
      span.textContent = item.val;
      chainEl.appendChild(span);
    });
    const curr = document.createElement('span');
    curr.className = 'chain-item current';
    curr.textContent = '= ' + this.current;
    chainEl.appendChild(curr);
  }
  renderOps() {
    const opsEl = document.getElementById('ops');
    opsEl.innerHTML = '';
    ['+', '-', '×'].forEach(op => {
      const btn = document.createElement('button');
      btn.className = 'op-btn op';
      btn.textContent = op;
      btn.addEventListener('click', () => this.selectOp(op));
      opsEl.appendChild(btn);
    });
    for (let i = 1; i <= 9; i++) {
      const btn = document.createElement('button');
      btn.className = 'op-btn';
      btn.textContent = i;
      btn.addEventListener('click', () => this.selectNum(i));
      opsEl.appendChild(btn);
    }
  }
  selectOp(op) {
    if (this.pendingOp) return;
    this.pendingOp = op;
    this.chain.push({ type: 'op', val: op });
    this.render();
  }
  selectNum(num) {
    if (!this.pendingOp) return;
    if (this.pendingOp === '+') this.current += num;
    else if (this.pendingOp === '-') this.current -= num;
    else this.current *= num;
    this.chain.push({ type: 'num', val: num });
    this.pendingOp = null;
    this.render();
    if (this.current === this.target) {
      this.level++;
      this.score += this.level * 10;
      chrome.storage.local.set({ mathChainScore: this.score, mathChainLevel: this.level });
      document.getElementById('message').textContent = `Correct! +${this.level * 10}`;
      document.getElementById('message').className = 'message success';
      this.updateStats();
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new MathChain());
