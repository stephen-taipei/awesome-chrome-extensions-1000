// Word Finder - Popup Script
class WordFinder {
  constructor() {
    this.wordList = ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'FISH', 'BIRD', 'TREE', 'FIRE', 'RAIN', 'SNOW', 'WIND', 'LEAF', 'ROCK', 'WAVE', 'LAKE', 'HILL', 'SAND', 'FROG', 'BEAR'];
    this.size = 8;
    this.grid = [];
    this.words = [];
    this.found = [];
    this.init();
  }
  init() {
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    document.getElementById('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.checkWord();
    });
    this.newPuzzle();
  }
  newPuzzle() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(''));
    this.words = [];
    this.found = [];
    const shuffled = [...this.wordList].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 4 && i < shuffled.length; i++) {
      if (this.placeWord(shuffled[i])) {
        this.words.push(shuffled[i]);
      }
    }
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (!this.grid[i][j]) {
          this.grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    document.getElementById('input').value = '';
    document.getElementById('message').textContent = '';
    this.render();
  }
  placeWord(word) {
    const dirs = [[0, 1], [1, 0], [1, 1]];
    for (let attempt = 0; attempt < 50; attempt++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const maxR = this.size - (dir[0] === 1 ? word.length : 1);
      const maxC = this.size - (dir[1] === 1 ? word.length : 1);
      if (maxR < 0 || maxC < 0) continue;
      const r = Math.floor(Math.random() * (maxR + 1));
      const c = Math.floor(Math.random() * (maxC + 1));
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dir[0] * i;
        const nc = c + dir[1] * i;
        if (this.grid[nr][nc] && this.grid[nr][nc] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          this.grid[r + dir[0] * i][c + dir[1] * i] = word[i];
        }
        return true;
      }
    }
    return false;
  }
  checkWord() {
    const input = document.getElementById('input').value.toUpperCase().trim();
    const msg = document.getElementById('message');
    if (this.words.includes(input) && !this.found.includes(input)) {
      this.found.push(input);
      msg.textContent = '✓ Found!';
      msg.className = 'message success';
      document.getElementById('input').value = '';
      this.render();
      if (this.found.length === this.words.length) {
        msg.textContent = '🎉 All words found!';
      }
    } else if (this.found.includes(input)) {
      msg.textContent = 'Already found!';
      msg.className = 'message error';
    } else {
      msg.textContent = 'Not in the list';
      msg.className = 'message error';
    }
  }
  render() {
    document.getElementById('words').innerHTML = this.words.map(w => `<span class="word${this.found.includes(w) ? ' found' : ''}">${w}</span>`).join('');
    document.getElementById('grid').innerHTML = this.grid.flat().map(c => `<div class="cell">${c}</div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new WordFinder());
