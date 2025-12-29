// Spot the Diff - Popup Script
class SpotDiff {
  constructor() {
    this.pairs = [['😀','😃'],['🐱','🐈'],['🍎','🍏'],['⭐','🌟'],['❤️','💗'],['🔵','🔷'],['🟢','🟩'],['🌙','🌛'],['👋','🖐️'],['🎈','🎊']];
    this.level = 1;
    this.score = 0;
    this.time = 10;
    this.timer = null;
    this.diffIdx = -1;
    this.init();
  }
  init() {
    chrome.storage.local.get(['spotScore'], (r) => {
      if (r.spotScore) this.score = r.spotScore;
      this.updateStats();
    });
    this.newRound();
  }
  newRound() {
    clearInterval(this.timer);
    this.time = Math.max(5, 11 - this.level);
    document.getElementById('time').textContent = this.time;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    const gridSize = Math.min(4 + Math.floor(this.level / 3), 6);
    const total = gridSize * gridSize;
    const pair = this.pairs[Math.floor(Math.random() * this.pairs.length)];
    this.diffIdx = Math.floor(Math.random() * total);
    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    grid.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = i === this.diffIdx ? pair[1] : pair[0];
      cell.addEventListener('click', () => this.check(i, cell));
      grid.appendChild(cell);
    }
    this.timer = setInterval(() => this.tick(), 1000);
  }
  tick() {
    this.time--;
    document.getElementById('time').textContent = this.time;
    if (this.time <= 0) {
      clearInterval(this.timer);
      document.getElementById('message').textContent = 'Time up!';
      document.getElementById('message').className = 'message error';
      this.level = 1;
      this.updateStats();
      setTimeout(() => this.newRound(), 1500);
    }
  }
  check(idx, cell) {
    clearInterval(this.timer);
    const cells = document.querySelectorAll('.cell');
    cells.forEach(c => c.style.pointerEvents = 'none');
    if (idx === this.diffIdx) {
      cell.classList.add('correct');
      this.score += this.level * 10;
      this.level++;
      chrome.storage.local.set({ spotScore: this.score });
      document.getElementById('message').textContent = `Found it! +${(this.level-1) * 10}`;
      document.getElementById('message').className = 'message success';
    } else {
      cell.classList.add('wrong');
      cells[this.diffIdx].classList.add('correct');
      this.level = 1;
      document.getElementById('message').textContent = 'Wrong!';
      document.getElementById('message').className = 'message error';
    }
    this.updateStats();
    setTimeout(() => this.newRound(), 1200);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new SpotDiff());
