// Whack-a-Mole - Popup Script
class WhackAMole {
  constructor() {
    this.score = 0;
    this.timeLeft = 30;
    this.timer = null;
    this.moleTimer = null;
    this.playing = false;
    this.activeHole = -1;
    this.init();
  }
  init() {
    const grid = document.getElementById('grid');
    for (let i = 0; i < 9; i++) {
      const hole = document.createElement('div');
      hole.className = 'hole';
      hole.dataset.index = i;
      hole.innerHTML = '<div class="mole"></div>';
      hole.addEventListener('click', () => this.whack(i));
      grid.appendChild(hole);
    }
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  start() {
    this.score = 0;
    this.timeLeft = 30;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('time').textContent = '30';
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('time').textContent = this.timeLeft;
      if (this.timeLeft <= 0) this.end();
    }, 1000);
    this.showMole();
  }
  showMole() {
    if (!this.playing) return;
    const holes = document.querySelectorAll('.hole');
    holes.forEach(h => h.classList.remove('active', 'whacked'));
    let newHole;
    do {
      newHole = Math.floor(Math.random() * 9);
    } while (newHole === this.activeHole);
    this.activeHole = newHole;
    holes[newHole].classList.add('active');
    const delay = Math.max(400, 1000 - this.score * 20);
    this.moleTimer = setTimeout(() => this.showMole(), delay);
  }
  whack(index) {
    if (!this.playing || index !== this.activeHole) return;
    const holes = document.querySelectorAll('.hole');
    holes[index].classList.add('whacked');
    holes[index].classList.remove('active');
    this.score++;
    document.getElementById('score').textContent = this.score;
    clearTimeout(this.moleTimer);
    this.activeHole = -1;
    setTimeout(() => this.showMole(), 200);
  }
  end() {
    this.playing = false;
    clearInterval(this.timer);
    clearTimeout(this.moleTimer);
    document.querySelectorAll('.hole').forEach(h => h.classList.remove('active'));
    alert(`Game Over! Score: ${this.score}`);
  }
}
document.addEventListener('DOMContentLoaded', () => new WhackAMole());
