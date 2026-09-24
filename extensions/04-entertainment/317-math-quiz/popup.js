// Math Quiz — arithmetic, not eval; one score update per question.
class MathQuiz {
  constructor() {
    this.score = 0;
    this.playing = false;
    this.pending = false;
    this.timer = null;
    this.nextQuestion = null;
    this.currentAnswer = 0;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('answer').addEventListener('input', event => this.checkAnswer(event));
    document.getElementById('answer').disabled = true;
  }
  start() {
    clearInterval(this.timer);
    clearTimeout(this.nextQuestion);
    this.score = 0;
    this.playing = true;
    this.pending = false;
    this.deadline = Date.now() + 30000;
    document.getElementById('score').textContent = '0';
    document.getElementById('timer').textContent = '30';
    document.getElementById('message').textContent = '';
    document.getElementById('answer').disabled = false;
    document.getElementById('startBtn').style.display = 'none';
    this.newProblem();
    this.timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
      document.getElementById('timer').textContent = String(remaining);
      if (remaining === 0) this.end();
    }, 200);
  }
  newProblem() {
    if (!this.playing) return;
    this.pending = false;
    const operation = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    const maximum = operation === '*' ? 12 : 50;
    let a = Math.floor(Math.random() * maximum) + 1;
    let b = Math.floor(Math.random() * maximum) + 1;
    if (operation === '-' && b > a) [a, b] = [b, a];
    this.currentAnswer = operation === '+' ? a + b : operation === '-' ? a - b : a * b;
    document.getElementById('problem').textContent = `${a} ${operation} ${b} = ?`;
    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();
  }
  checkAnswer(event) {
    if (!this.playing || this.pending) return;
    if (Date.now() >= this.deadline) { this.end(); return; }
    const value = event.target.value.trim();
    if (!/^\d+$/.test(value) || Number(value) !== this.currentAnswer) return;
    this.pending = true;
    this.score++;
    document.getElementById('score').textContent = String(this.score);
    document.getElementById('message').textContent = 'Correct!';
    document.getElementById('message').className = 'message correct';
    this.nextQuestion = setTimeout(() => {
      if (!this.playing) return;
      if (Date.now() >= this.deadline) { this.end(); return; }
      document.getElementById('message').textContent = '';
      this.newProblem();
    }, 300);
  }
  end() {
    clearInterval(this.timer);
    clearTimeout(this.nextQuestion);
    this.playing = false;
    this.pending = false;
    document.getElementById('answer').disabled = true;
    document.getElementById('timer').textContent = '0';
    document.getElementById('problem').textContent = `Time's up! Score: ${this.score}`;
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('startBtn').textContent = 'Play Again';
  }
}
document.addEventListener('DOMContentLoaded', () => new MathQuiz());
