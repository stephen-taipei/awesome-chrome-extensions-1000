// Word Search - Popup Script
class WordSearch {
  constructor() {
    this.size = 8;
    this.words = ['CAT', 'DOG', 'SUN', 'RUN', 'FUN'];
    this.grid = [];
    this.foundWords = [];
    this.selecting = false;
    this.selected = [];
    this.init();
  }
  init() {
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    this.newPuzzle();
  }
  newPuzzle() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(''));
    this.foundWords = [];
    this.placeWords();
    this.fillRandom();
    this.render();
  }
  placeWords() {
    for (const word of this.words) {
      let placed = false;
      for (let tries = 0; tries < 50 && !placed; tries++) {
        const dir = Math.floor(Math.random() * 2); // 0=horizontal, 1=vertical
        const r = Math.floor(Math.random() * (dir === 1 ? this.size - word.length : this.size));
        const c = Math.floor(Math.random() * (dir === 0 ? this.size - word.length : this.size));
        if (this.canPlace(word, r, c, dir)) {
          for (let i = 0; i < word.length; i++) {
            if (dir === 0) this.grid[r][c + i] = word[i];
            else this.grid[r + i][c] = word[i];
          }
          placed = true;
        }
      }
    }
  }
  canPlace(word, r, c, dir) {
    for (let i = 0; i < word.length; i++) {
      const nr = dir === 1 ? r + i : r;
      const nc = dir === 0 ? c + i : c;
      if (this.grid[nr][nc] !== '' && this.grid[nr][nc] !== word[i]) return false;
    }
    return true;
  }
  fillRandom() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c]) this.grid[r][c] = letters[Math.floor(Math.random() * 26)];
      }
    }
  }
  render() {
    const wordsEl = document.getElementById('words');
    wordsEl.innerHTML = this.words.map(w =>
      `<span class="${this.foundWords.includes(w) ? 'found' : ''}">${w}</span>`
    ).join('');
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = this.grid[r][c];
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.addEventListener('mousedown', () => this.startSelect(r, c));
        cell.addEventListener('mouseenter', () => this.continueSelect(r, c));
        cell.addEventListener('mouseup', () => this.endSelect());
        gridEl.appendChild(cell);
      }
    }
  }
  startSelect(r, c) {
    this.selecting = true;
    this.selected = [{ r, c }];
    this.updateSelection();
  }
  continueSelect(r, c) {
    if (!this.selecting) return;
    if (this.selected.length === 1 || this.isValidDirection(r, c)) {
      if (!this.selected.find(s => s.r === r && s.c === c)) {
        this.selected.push({ r, c });
        this.updateSelection();
      }
    }
  }
  isValidDirection(r, c) {
    if (this.selected.length < 2) return true;
    const dr = this.selected[1].r - this.selected[0].r;
    const dc = this.selected[1].c - this.selected[0].c;
    const last = this.selected[this.selected.length - 1];
    return (r - last.r === dr && c - last.c === dc);
  }
  updateSelection() {
    document.querySelectorAll('.cell').forEach(cell => {
      const r = parseInt(cell.dataset.r);
      const c = parseInt(cell.dataset.c);
      cell.classList.toggle('selected', this.selected.some(s => s.r === r && s.c === c));
    });
  }
  endSelect() {
    if (!this.selecting) return;
    this.selecting = false;
    const word = this.selected.map(s => this.grid[s.r][s.c]).join('');
    if (this.words.includes(word) && !this.foundWords.includes(word)) {
      this.foundWords.push(word);
      this.selected.forEach(s => {
        const cell = document.querySelector(`.cell[data-r="${s.r}"][data-c="${s.c}"]`);
        if (cell) cell.classList.add('found');
      });
      this.render();
      if (this.foundWords.length === this.words.length) {
        setTimeout(() => alert('You found all words!'), 100);
      }
    }
    this.selected = [];
    this.updateSelection();
  }
}
document.addEventListener('DOMContentLoaded', () => new WordSearch());
