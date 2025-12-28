// Speed Math - Popup Script
class SpeedMath {
  constructor() {
    this.score = 0;
    this.best = 0;
    this.time = 30;
    this.answer = 0;
    this.gameRunning = false;
    this.interval = null;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['speedMathBest']);
    this.best = data.speedMathBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('options').addEventListener('click', (e) => this.check(e));
  }
  start() {
    this.score = 0;
    this.time = 30;
    this.gameRunning = true;
    document.getElementById('score').textContent = 0;
    document.getElementById('timer').textContent = 30;
    document.getElementById('feedback').textContent = '';
    document.getElementById('startBtn').style.display = 'none';
    this.newProblem();
    this.interval = setInterval(() => {
      this.time--;
      document.getElementById('timer').textContent = this.time;
      if (this.time <= 0) this.gameOver();
    }, 1000);
  }
  newProblem() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;
    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      this.answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * a);
      this.answer = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      this.answer = a * b;
    }
    document.getElementById('problem').textContent = `${a} ${op} ${b} = ?`;
    const options = [this.answer];
    while (options.length < 4) {
      const wrong = this.answer + Math.floor(Math.random() * 20) - 10;
      if (wrong !== this.answer && wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    options.sort(() => Math.random() - 0.5);
    document.getElementById('options').innerHTML = options.map(o => `<button class="option" data-value="${o}">${o}</button>`).join('');
  }
  check(e) {
    if (!this.gameRunning || !e.target.classList.contains('option')) return;
    const value = parseInt(e.target.dataset.value);
    if (value === this.answer) {
      e.target.classList.add('correct');
      this.score++;
      document.getElementById('score').textContent = this.score;
      setTimeout(() => this.newProblem(), 200);
    } else {
      e.target.classList.add('wrong');
      setTimeout(() => e.target.classList.remove('wrong'), 300);
    }
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ speedMathBest: this.best });
    }
    document.getElementById('feedback').textContent = `Game Over! Score: ${this.score}`;
    document.getElementById('startBtn').textContent = 'Play Again';
    document.getElementById('startBtn').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new SpeedMath());
