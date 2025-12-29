// Quick Math - Popup Script
class QuickMath {
  constructor() {
    this.score = 0;
    this.best = 0;
    this.timeLeft = 100;
    this.timer = null;
    this.playing = false;
    this.answer = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['quickMathBest'], (r) => {
      this.best = r.quickMathBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  start() {
    this.score = 0;
    this.timeLeft = 100;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('startBtn').disabled = true;
    this.newProblem();
    this.runTimer();
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
    this.renderAnswers();
  }
  renderAnswers() {
    const answers = [this.answer];
    while (answers.length < 4) {
      const wrong = this.answer + (Math.floor(Math.random() * 20) - 10);
      if (wrong !== this.answer && wrong > 0 && !answers.includes(wrong)) {
        answers.push(wrong);
      }
    }
    answers.sort(() => Math.random() - 0.5);
    const el = document.getElementById('answers');
    el.innerHTML = answers.map(a => `<button class="answer-btn" data-val="${a}">${a}</button>`).join('');
    el.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', () => this.checkAnswer(parseInt(btn.dataset.val), btn));
    });
  }
  checkAnswer(val, btn) {
    if (!this.playing) return;
    if (val === this.answer) {
      btn.classList.add('correct');
      this.score++;
      document.getElementById('score').textContent = this.score;
      this.timeLeft = Math.min(100, this.timeLeft + 5);
      setTimeout(() => this.newProblem(), 200);
    } else {
      btn.classList.add('wrong');
      this.timeLeft -= 10;
    }
  }
  runTimer() {
    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      document.getElementById('timerFill').style.width = Math.max(0, this.timeLeft) + '%';
      if (this.timeLeft <= 0) this.end();
    }, 300);
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('problem').textContent = 'Time Up!';
    document.getElementById('message').textContent = 'Score: ' + this.score;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ quickMathBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new QuickMath());
