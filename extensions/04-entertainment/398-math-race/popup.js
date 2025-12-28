// Math Race - Popup Script
class MathRace {
  constructor() {
    this.problems = 20;
    this.solved = 0;
    this.answer = 0;
    this.startTime = 0;
    this.timer = null;
    this.best = null;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['mathRaceBest'], (r) => {
      this.best = r.mathRaceBest || null;
      document.getElementById('best').textContent = this.best ? this.best.toFixed(1) + 's' : '--';
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('input').addEventListener('input', (e) => this.check(e));
  }
  start() {
    this.solved = 0;
    this.playing = true;
    this.startTime = Date.now();
    document.getElementById('progress').textContent = '0';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('input').value = '';
    document.getElementById('input').disabled = false;
    document.getElementById('startBtn').disabled = true;
    this.newProblem();
    this.runTimer();
    document.getElementById('input').focus();
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
  }
  check(e) {
    if (!this.playing) return;
    const val = parseInt(e.target.value);
    if (val === this.answer) {
      this.solved++;
      document.getElementById('progress').textContent = this.solved;
      document.getElementById('progressFill').style.width = (this.solved / this.problems * 100) + '%';
      document.getElementById('input').value = '';
      if (this.solved >= this.problems) {
        this.end();
      } else {
        this.newProblem();
      }
    }
  }
  runTimer() {
    this.timer = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      document.getElementById('time').textContent = elapsed.toFixed(1);
    }, 100);
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    const finalTime = (Date.now() - this.startTime) / 1000;
    document.getElementById('time').textContent = finalTime.toFixed(1);
    document.getElementById('problem').textContent = '🎉 ' + finalTime.toFixed(1) + 's';
    document.getElementById('input').disabled = true;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Race Again';
    if (this.best === null || finalTime < this.best) {
      this.best = finalTime;
      document.getElementById('best').textContent = this.best.toFixed(1) + 's';
      chrome.storage.local.set({ mathRaceBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new MathRace());
