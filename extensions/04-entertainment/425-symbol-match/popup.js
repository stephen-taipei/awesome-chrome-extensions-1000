// Symbol Match - Popup Script
class SymbolMatch {
  constructor() {
    this.symbols = ['🔴','🟢','🔵','🟡','🟣','🟠'];
    this.grid = [];
    this.size = 6;
    this.selected = -1;
    this.score = 0;
    this.moves = 20;
    this.init();
  }
  init() {
    document.getElementById('newBtn').addEventListener('click', () => this.newGame());
    this.newGame();
  }
  newGame() {
    this.grid = [];
    for (let i = 0; i < this.size * this.size; i++) {
      this.grid.push(Math.floor(Math.random() * this.symbols.length));
    }
    this.selected = -1;
    this.score = 0;
    this.moves = 20;
    this.removeMatches();
    this.render();
    this.updateStats();
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    this.grid.forEach((s, idx) => {
      const cell = document.createElement('button');
      cell.className = 'cell' + (idx === this.selected ? ' selected' : '');
      cell.textContent = this.symbols[s];
      cell.addEventListener('click', () => this.select(idx));
      gridEl.appendChild(cell);
    });
  }
  select(idx) {
    if (this.moves <= 0) return;
    if (this.selected === -1) {
      this.selected = idx;
      this.render();
    } else if (this.selected === idx) {
      this.selected = -1;
      this.render();
    } else {
      if (this.areAdjacent(this.selected, idx)) {
        [this.grid[this.selected], this.grid[idx]] = [this.grid[idx], this.grid[this.selected]];
        this.moves--;
        const matches = this.findMatches();
        if (matches.length > 0) {
          this.processMatches(matches);
        } else {
          [this.grid[this.selected], this.grid[idx]] = [this.grid[idx], this.grid[this.selected]];
          document.getElementById('message').textContent = 'No match!';
          document.getElementById('message').className = 'message error';
        }
      }
      this.selected = -1;
      this.render();
      this.updateStats();
    }
  }
  areAdjacent(a, b) {
    const rowA = Math.floor(a / this.size), colA = a % this.size;
    const rowB = Math.floor(b / this.size), colB = b % this.size;
    return (Math.abs(rowA - rowB) === 1 && colA === colB) || (Math.abs(colA - colB) === 1 && rowA === rowB);
  }
  findMatches() {
    const matches = new Set();
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size - 2; c++) {
        const idx = r * this.size + c;
        if (this.grid[idx] === this.grid[idx+1] && this.grid[idx] === this.grid[idx+2]) {
          matches.add(idx); matches.add(idx+1); matches.add(idx+2);
        }
      }
    }
    for (let c = 0; c < this.size; c++) {
      for (let r = 0; r < this.size - 2; r++) {
        const idx = r * this.size + c;
        if (this.grid[idx] === this.grid[idx+this.size] && this.grid[idx] === this.grid[idx+this.size*2]) {
          matches.add(idx); matches.add(idx+this.size); matches.add(idx+this.size*2);
        }
      }
    }
    return [...matches];
  }
  processMatches(matches) {
    this.score += matches.length * 10;
    document.getElementById('message').textContent = `+${matches.length * 10} points!`;
    document.getElementById('message').className = 'message success';
    matches.forEach(idx => this.grid[idx] = Math.floor(Math.random() * this.symbols.length));
    this.removeMatches();
  }
  removeMatches() {
    let matches = this.findMatches();
    while (matches.length > 0) {
      matches.forEach(idx => this.grid[idx] = Math.floor(Math.random() * this.symbols.length));
      matches = this.findMatches();
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('moves').textContent = this.moves;
    if (this.moves <= 0) {
      document.getElementById('message').textContent = `Game Over! Score: ${this.score}`;
      document.getElementById('message').className = 'message';
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new SymbolMatch());
