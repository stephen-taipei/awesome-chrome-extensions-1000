// Word Search - Popup Script
class WordSearch {
  constructor() {
    this.wordList = ['CAT', 'DOG', 'SUN', 'RUN', 'FLY', 'RED', 'BIG', 'HOT', 'TOP', 'BOX'];
    this.words = [];
    this.grid = [];
    this.size = 8;
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
    this.words = [...this.wordList].sort(() => Math.random() - 0.5).slice(0, 4);
    this.foundWords = [];
    this.words.forEach(word => this.placeWord(word));
    this.fillEmpty();
    this.render();
    document.getElementById('message').textContent = '';
  }
  placeWord(word) {
    const dirs = [[0, 1], [1, 0], [1, 1]];
    for (let tries = 0; tries < 50; tries++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const maxR = this.size - (dir[0] * word.length);
      const maxC = this.size - (dir[1] * word.length);
      if (maxR < 1 || maxC < 1) continue;
      const r = Math.floor(Math.random() * maxR);
      const c = Math.floor(Math.random() * maxC);
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const cell = this.grid[r + dir[0] * i][c + dir[1] * i];
        if (cell !== '' && cell !== word[i]) { canPlace = false; break; }
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          this.grid[r + dir[0] * i][c + dir[1] * i] = word[i];
        }
        return;
      }
    }
  }
  fillEmpty() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === '') {
          this.grid[r][c] = letters[Math.floor(Math.random() * 26)];
        }
      }
    }
  }
  render() {
    document.getElementById('words').innerHTML = this.words.map(w =>
      `<span class="word ${this.foundWords.includes(w) ? 'found' : ''}">${w}</span>`
    ).join('');
    const grid = document.getElementById('grid');
    grid.innerHTML = this.grid.map((row, r) => row.map((cell, c) =>
      `<div class="cell" data-r="${r}" data-c="${c}">${cell}</div>`
    ).join('')).join('');
    grid.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('mousedown', () => this.startSelect(cell));
      cell.addEventListener('mouseenter', () => this.continueSelect(cell));
      cell.addEventListener('mouseup', () => this.endSelect());
    });
    document.addEventListener('mouseup', () => this.endSelect());
  }
  startSelect(cell) {
    this.selecting = true;
    this.selected = [{ r: +cell.dataset.r, c: +cell.dataset.c }];
    cell.classList.add('selected');
  }
  continueSelect(cell) {
    if (!this.selecting) return;
    const r = +cell.dataset.r, c = +cell.dataset.c;
    if (!this.selected.find(s => s.r === r && s.c === c)) {
      this.selected.push({ r, c });
      cell.classList.add('selected');
    }
  }
  endSelect() {
    if (!this.selecting) return;
    this.selecting = false;
    const word = this.selected.map(s => this.grid[s.r][s.c]).join('');
    if (this.words.includes(word) && !this.foundWords.includes(word)) {
      this.foundWords.push(word);
      this.selected.forEach(s => {
        document.querySelector(`[data-r="${s.r}"][data-c="${s.c}"]`).classList.add('found');
      });
      this.render();
      if (this.foundWords.length === this.words.length) {
        document.getElementById('message').textContent = '🎉 All words found!';
      }
    }
    document.querySelectorAll('.cell.selected').forEach(c => c.classList.remove('selected'));
    this.selected = [];
  }
}
document.addEventListener('DOMContentLoaded', () => new WordSearch());
