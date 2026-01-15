// Count Shapes - Popup Script
class CountShapes {
  constructor() {
    this.shapes = ['●', '■', '▲', '★', '◆', '♥'];
    this.target = '';
    this.correctCount = 0;
    this.userAnswer = 0;
    this.score = 0;
    this.streak = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['countShapesScore'], (r) => {
      this.score = r.countShapesScore || 0;
      document.getElementById('score').textContent = this.score;
    });
    document.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.userAnswer = Math.max(0, this.userAnswer + parseInt(btn.dataset.delta));
        document.getElementById('answer').textContent = this.userAnswer;
      });
    });
    document.getElementById('submitBtn').addEventListener('click', () => this.submit());
    this.newGame();
  }
  newGame() {
    this.target = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    document.getElementById('targetShape').textContent = this.target;
    const display = document.getElementById('display');
    display.innerHTML = '';
    const totalShapes = 15 + Math.floor(Math.random() * 15);
    const targetCount = 3 + Math.floor(Math.random() * 8);
    this.correctCount = targetCount;
    const allShapes = [];
    for (let i = 0; i < targetCount; i++) allShapes.push(this.target);
    while (allShapes.length < totalShapes) {
      const other = this.shapes.filter(s => s !== this.target);
      allShapes.push(other[Math.floor(Math.random() * other.length)]);
    }
    allShapes.sort(() => Math.random() - 0.5);
    allShapes.forEach(shape => {
      const el = document.createElement('div');
      el.className = 'shape';
      el.textContent = shape;
      el.style.left = Math.random() * 250 + 'px';
      el.style.top = Math.random() * 120 + 'px';
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      display.appendChild(el);
    });
    this.userAnswer = 0;
    document.getElementById('answer').textContent = '0';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  submit() {
    const fb = document.getElementById('feedback');
    if (this.userAnswer === this.correctCount) {
      this.streak++;
      const bonus = 10 + this.streak * 2;
      this.score += bonus;
      chrome.storage.local.set({ countShapesScore: this.score });
      document.getElementById('score').textContent = this.score;
      document.getElementById('streak').textContent = this.streak;
      fb.textContent = `✓ Correct! +${bonus}`;
      fb.className = 'feedback correct';
      setTimeout(() => this.newGame(), 1000);
    } else {
      this.streak = 0;
      document.getElementById('streak').textContent = '0';
      fb.textContent = `✗ It was ${this.correctCount}!`;
      fb.className = 'feedback wrong';
      setTimeout(() => this.newGame(), 1500);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new CountShapes());
