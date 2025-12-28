// Math Quiz - Popup Script
class MathQuiz {
  constructor() {
    this.score = 0;
    this.timeLeft = 30;
    this.timer = null;
    this.currentAnswer = 0;
    this.playing = false;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('answer').addEventListener('input', (e) => this.checkAnswer(e));
  }
  start() {
    this.score = 0;
    this.timeLeft = 30;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('timer').textContent = '30';
    document.getElementById('message').textContent = '';
    document.getElementById('answer').disabled = false;
    document.getElementById('startBtn').style.display = 'none';
    this.newProblem();
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('timer').textContent = this.timeLeft;
      if (this.timeLeft <= 0) this.end();
    }, 1000);
  }
  newProblem() {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;
    if (op === '*') {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
    } else {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
    }
    if (op === '-' && b > a) [a, b] = [b, a];
    this.currentAnswer = eval(`${a}${op}${b}`);
    document.getElementById('problem').textContent = `${a} ${op} ${b} = ?`;
    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();
  }
  checkAnswer(e) {
    if (!this.playing) return;
    const val = parseInt(e.target.value);
    if (val === this.currentAnswer) {
      this.score++;
      document.getElementById('score').textContent = this.score;
      document.getElementById('message').textContent = 'Correct!';
      document.getElementById('message').className = 'message correct';
      setTimeout(() => {
        document.getElementById('message').textContent = '';
        this.newProblem();
      }, 300);
    }
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    document.getElementById('answer').disabled = true;
    document.getElementById('problem').innerHTML = `<div class="final">Time's up!<br>Score: ${this.score}</div>`;
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('startBtn').textContent = 'Play Again';
  }
}
document.addEventListener('DOMContentLoaded', () => new MathQuiz());
