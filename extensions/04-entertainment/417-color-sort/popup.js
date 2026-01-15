// Color Sort - Popup Script
class ColorSort {
  constructor() {
    this.colors = ['#ef4444','#22c55e','#3b82f6','#eab308'];
    this.tubes = [];
    this.selected = -1;
    this.moves = 0;
    this.level = 1;
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorSortLevel'], (r) => {
      if (r.colorSortLevel) this.level = r.colorSortLevel;
      this.updateStats();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    const numColors = Math.min(3 + Math.floor(this.level / 2), 4);
    const balls = [];
    for (let i = 0; i < numColors; i++) {
      for (let j = 0; j < 4; j++) balls.push(this.colors[i]);
    }
    for (let i = balls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [balls[i], balls[j]] = [balls[j], balls[i]];
    }
    this.tubes = [];
    for (let i = 0; i < numColors; i++) {
      this.tubes.push(balls.slice(i * 4, (i + 1) * 4));
    }
    this.tubes.push([]);
    this.tubes.push([]);
    this.selected = -1;
    this.moves = 0;
    this.render();
    this.updateStats();
  }
  render() {
    const container = document.getElementById('tubes');
    container.innerHTML = '';
    this.tubes.forEach((tube, idx) => {
      const tubeEl = document.createElement('div');
      tubeEl.className = 'tube' + (idx === this.selected ? ' selected' : '');
      tube.forEach(color => {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.style.background = color;
        tubeEl.appendChild(ball);
      });
      tubeEl.addEventListener('click', () => this.clickTube(idx));
      container.appendChild(tubeEl);
    });
  }
  clickTube(idx) {
    if (this.selected === -1) {
      if (this.tubes[idx].length > 0) {
        this.selected = idx;
        this.render();
      }
    } else {
      if (idx === this.selected) {
        this.selected = -1;
        this.render();
        return;
      }
      const from = this.tubes[this.selected];
      const to = this.tubes[idx];
      if (to.length < 4 && (to.length === 0 || to[to.length - 1] === from[from.length - 1])) {
        to.push(from.pop());
        this.moves++;
        this.updateStats();
        if (this.checkWin()) {
          this.level++;
          chrome.storage.local.set({ colorSortLevel: this.level });
          setTimeout(() => {
            alert('Level Complete!');
            this.newGame();
          }, 300);
        }
      }
      this.selected = -1;
      this.render();
    }
  }
  checkWin() {
    return this.tubes.every(tube => {
      if (tube.length === 0) return true;
      if (tube.length !== 4) return false;
      return tube.every(c => c === tube[0]);
    });
  }
  updateStats() {
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorSort());
