// Math Grid - Popup Script
class MathGrid {
  constructor() {
    this.a = 0; this.b = 0; this.c = 0;
    this.op = '+';
    this.missing = 0;
    this.answer = 0;
    this.score = 0;
    this.streak = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['mathGridScore'], (r) => {
      if (r.mathGridScore) this.score = r.mathGridScore;
      this.updateStats();
    });
    this.newRound();
  }
  newRound() {
    this.op = Math.random() < 0.5 ? '+' : '-';
    if (this.op === '+') {
      this.a = Math.floor(Math.random() * 20) + 1;
      this.b = Math.floor(Math.random() * 20) + 1;
      this.c = this.a + this.b;
    } else {
      this.c = Math.floor(Math.random() * 30) + 10;
      this.b = Math.floor(Math.random() * (this.c - 1)) + 1;
      this.a = this.c - this.b;
    }
    this.missing = Math.floor(Math.random() * 3);
    this.answer = [this.a, this.b, this.c][this.missing];
    this.render();
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
  }
  render() {
    const vals = [this.a, this.op, this.b, '=', this.c];
    const missingIdx = this.missing * 2;
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    vals.forEach((v, i) => {
      const cell = document.createElement('div');
      if (i === 1) cell.className = 'cell op';
      else if (i === 3) cell.className = 'cell eq';
      else if (i === missingIdx) cell.className = 'cell missing';
      else cell.className = 'cell';
      cell.textContent = i === missingIdx ? '?' : v;
      grid.appendChild(cell);
    });
    const options = [this.answer];
    while (options.length < 4) {
      const n = this.answer + Math.floor(Math.random() * 11) - 5;
      if (n > 0 && !options.includes(n)) options.push(n);
    }
    options.sort(() => Math.random() - 0.5);
    const optEl = document.getElementById('options');
    optEl.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.guess(opt, btn));
      optEl.appendChild(btn);
    });
  }
  guess(opt, btn) {
    const btns = document.querySelectorAll('.option');
    btns.forEach(b => b.disabled = true);
    if (opt === this.answer) {
      btn.classList.add('correct');
      this.streak++;
      this.score += 10 + this.streak * 2;
      chrome.storage.local.set({ mathGridScore: this.score });
      document.getElementById('message').textContent = `Correct! +${10 + this.streak * 2}`;
      document.getElementById('message').className = 'message success';
    } else {
      btn.classList.add('wrong');
      btns.forEach(b => { if (parseInt(b.textContent) === this.answer) b.classList.add('correct'); });
      this.streak = 0;
      document.getElementById('message').textContent = `Answer: ${this.answer}`;
      document.getElementById('message').className = 'message error';
    }
    this.updateStats();
    setTimeout(() => this.newRound(), 1200);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
  }
}
document.addEventListener('DOMContentLoaded', () => new MathGrid());
