// Word Hunt - Popup Script
class WordHunt {
  constructor() {
    this.size = 8;
    this.grid = [];
    this.words = [];
    this.foundWords = [];
    this.selected = [];
    this.foundCells = new Set();
    this.init();
  }
  init() {
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    this.newPuzzle();
  }
  newPuzzle() {
    this.words = ['CAT','DOG','SUN','RUN','HAT','FUN','RED','TOP'].slice(0, 4);
    this.foundWords = [];
    this.foundCells = new Set();
    this.selected = [];
    this.grid = [];
    for (let i = 0; i < this.size * this.size; i++) {
      this.grid.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
    }
    this.words.forEach(word => this.placeWord(word));
    this.render();
    this.renderWords();
    this.updateStats();
  }
  placeWord(word) {
    const dirs = [[0,1],[1,0],[1,1]];
    for (let tries = 0; tries < 50; tries++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const startR = Math.floor(Math.random() * (this.size - word.length * Math.abs(dir[0])));
      const startC = Math.floor(Math.random() * (this.size - word.length * Math.abs(dir[1])));
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = startR + i * dir[0];
        const c = startC + i * dir[1];
        const idx = r * this.size + c;
        if (this.grid[idx] !== word[i] && !this.isRandom(idx)) canPlace = false;
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = startR + i * dir[0];
          const c = startC + i * dir[1];
          this.grid[r * this.size + c] = word[i];
        }
        return;
      }
    }
  }
  isRandom(idx) {
    return !this.words.some(w => {
      for (let i = 0; i < w.length; i++) {
        if (this.grid[idx] === w[i]) return false;
      }
      return true;
    });
  }
  render() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    this.grid.forEach((letter, idx) => {
      const cell = document.createElement('button');
      cell.className = 'cell';
      if (this.selected.includes(idx)) cell.classList.add('selected');
      if (this.foundCells.has(idx)) cell.classList.add('found');
      cell.textContent = letter;
      cell.addEventListener('mousedown', () => this.startSelect(idx));
      cell.addEventListener('mouseenter', (e) => { if (e.buttons) this.addSelect(idx); });
      cell.addEventListener('mouseup', () => this.endSelect());
      gridEl.appendChild(cell);
    });
  }
  renderWords() {
    const wordsEl = document.getElementById('words');
    wordsEl.innerHTML = '';
    this.words.forEach(word => {
      const span = document.createElement('span');
      span.className = 'word' + (this.foundWords.includes(word) ? ' found' : '');
      span.textContent = word;
      wordsEl.appendChild(span);
    });
  }
  startSelect(idx) {
    this.selected = [idx];
    this.render();
  }
  addSelect(idx) {
    if (!this.selected.includes(idx)) {
      this.selected.push(idx);
      this.render();
    }
  }
  endSelect() {
    const word = this.selected.map(i => this.grid[i]).join('');
    if (this.words.includes(word) && !this.foundWords.includes(word)) {
      this.foundWords.push(word);
      this.selected.forEach(i => this.foundCells.add(i));
      this.renderWords();
      this.updateStats();
    }
    this.selected = [];
    this.render();
  }
  updateStats() {
    document.getElementById('found').textContent = this.foundWords.length;
    document.getElementById('total').textContent = this.words.length;
  }
}
document.addEventListener('DOMContentLoaded', () => new WordHunt());
