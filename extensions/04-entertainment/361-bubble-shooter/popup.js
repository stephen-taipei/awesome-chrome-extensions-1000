// Bubble Shooter - Popup Script
class BubbleShooter {
  constructor() {
    this.cols = 8;
    this.rows = 6;
    this.colors = 5;
    this.grid = [];
    this.current = 0;
    this.next = 0;
    this.score = 0;
    this.best = 0;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['bubbleBest']);
    this.best = data.bubbleBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    document.getElementById('game').addEventListener('click', (e) => this.shoot(e));
    this.newGame();
  }
  newGame() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = r < 3 ? Math.floor(Math.random() * this.colors) : -1;
      }
    }
    this.score = 0;
    this.current = Math.floor(Math.random() * this.colors);
    this.next = Math.floor(Math.random() * this.colors);
    document.getElementById('score').textContent = 0;
    this.render();
  }
  shoot(e) {
    const bubble = e.target;
    if (!bubble.classList.contains('bubble')) return;
    const r = parseInt(bubble.dataset.row);
    const c = parseInt(bubble.dataset.col);
    if (this.grid[r][c] !== -1) return;
    let targetR = r;
    for (let i = r; i >= 0; i--) {
      if (this.grid[i][c] !== -1) break;
      targetR = i;
    }
    this.grid[targetR][c] = this.current;
    const matches = this.findMatches(targetR, c);
    if (matches.length >= 3) {
      matches.forEach(([mr, mc]) => this.grid[mr][mc] = -1);
      this.score += matches.length * 10;
      document.getElementById('score').textContent = this.score;
      if (this.score > this.best) {
        this.best = this.score;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ bubbleBest: this.best });
      }
    }
    this.current = this.next;
    this.next = Math.floor(Math.random() * this.colors);
    this.render();
  }
  findMatches(r, c) {
    const color = this.grid[r][c];
    const visited = new Set();
    const matches = [];
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const key = `${cr},${cc}`;
      if (visited.has(key)) continue;
      if (cr < 0 || cr >= this.rows || cc < 0 || cc >= this.cols) continue;
      if (this.grid[cr][cc] !== color) continue;
      visited.add(key);
      matches.push([cr, cc]);
      stack.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
    }
    return matches;
  }
  render() {
    const game = document.getElementById('game');
    game.innerHTML = '';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble ' + (this.grid[r][c] >= 0 ? 'c' + this.grid[r][c] : 'empty');
        bubble.dataset.row = r;
        bubble.dataset.col = c;
        game.appendChild(bubble);
      }
    }
    document.getElementById('current').className = 'current bubble c' + this.current;
    document.getElementById('next').className = 'next bubble c' + this.next;
  }
}
document.addEventListener('DOMContentLoaded', () => new BubbleShooter());
