// Pattern Match - Popup Script
class PatternMatch {
  constructor() {
    this.pattern = [];
    this.playerPattern = [];
    this.level = 1;
    this.score = 0;
    this.playing = false;
    this.showing = false;
    this.init();
  }
  init() {
    const grid = document.getElementById('grid');
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', () => this.cellClick(i));
      grid.appendChild(cell);
    }
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  start() {
    this.pattern = [];
    this.level = 1;
    this.score = 0;
    this.playing = true;
    this.updateUI();
    this.nextLevel();
  }
  nextLevel() {
    this.playerPattern = [];
    this.pattern.push(Math.floor(Math.random() * 9));
    document.getElementById('status').textContent = 'Watch...';
    this.showPattern();
  }
  async showPattern() {
    this.showing = true;
    await this.delay(500);
    for (const idx of this.pattern) {
      const cell = document.querySelector(`.cell[data-index="${idx}"]`);
      cell.classList.add('active');
      await this.delay(400);
      cell.classList.remove('active');
      await this.delay(200);
    }
    this.showing = false;
    document.getElementById('status').textContent = 'Your turn!';
  }
  cellClick(index) {
    if (!this.playing || this.showing) return;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.classList.add('flash');
    setTimeout(() => cell.classList.remove('flash'), 200);
    this.playerPattern.push(index);
    const pos = this.playerPattern.length - 1;
    if (this.playerPattern[pos] !== this.pattern[pos]) {
      this.gameOver();
      return;
    }
    if (this.playerPattern.length === this.pattern.length) {
      this.score += this.level * 10;
      this.level++;
      this.updateUI();
      document.getElementById('status').textContent = 'Correct!';
      setTimeout(() => this.nextLevel(), 1000);
    }
  }
  gameOver() {
    this.playing = false;
    document.querySelectorAll('.cell').forEach(c => c.classList.add('wrong'));
    setTimeout(() => document.querySelectorAll('.cell').forEach(c => c.classList.remove('wrong')), 500);
    document.getElementById('status').textContent = `Game Over! Final Score: ${this.score}`;
  }
  updateUI() {
    document.getElementById('level').textContent = this.level;
    document.getElementById('score').textContent = this.score;
  }
  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}
document.addEventListener('DOMContentLoaded', () => new PatternMatch());
