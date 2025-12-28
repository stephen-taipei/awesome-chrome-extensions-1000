// Crossword - Popup Script
class Crossword {
  constructor() {
    this.puzzle = [
      ['C', 'A', 'T', '', 'D'],
      ['', 'P', '', '', 'O'],
      ['S', 'P', 'O', 'T', 'G'],
      ['', 'L', '', '', ''],
      ['', 'E', 'A', 'T', '']
    ];
    this.clues = {
      across: [
        { num: 1, clue: 'Meowing pet', row: 0, col: 0, len: 3 },
        { num: 3, clue: 'A location', row: 2, col: 0, len: 4 },
        { num: 4, clue: 'Consume food', row: 4, col: 1, len: 3 }
      ],
      down: [
        { num: 1, clue: 'Canine friend', row: 0, col: 4, len: 3 },
        { num: 2, clue: 'Fruit', row: 0, col: 1, len: 5 }
      ]
    };
    this.init();
  }
  init() {
    this.renderGrid();
    this.renderClues();
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
  }
  renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    let num = 1;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell' + (this.puzzle[r][c] === '' ? ' blocked' : '');
        if (this.puzzle[r][c] !== '') {
          const showNum = this.getClueNum(r, c);
          cell.innerHTML = `${showNum ? `<span class="num">${showNum}</span>` : ''}<input type="text" maxlength="1" data-r="${r}" data-c="${c}">`;
        }
        grid.appendChild(cell);
      }
    }
  }
  getClueNum(r, c) {
    for (const clue of [...this.clues.across, ...this.clues.down]) {
      if (clue.row === r && clue.col === c) return clue.num;
    }
    return null;
  }
  renderClues() {
    const cluesEl = document.getElementById('clues');
    cluesEl.innerHTML = `
      <h3>Across</h3>
      ${this.clues.across.map(c => `<p>${c.num}. ${c.clue}</p>`).join('')}
      <h3 style="margin-top:8px">Down</h3>
      ${this.clues.down.map(c => `<p>${c.num}. ${c.clue}</p>`).join('')}
    `;
  }
  check() {
    const inputs = document.querySelectorAll('.cell input');
    let correct = 0;
    inputs.forEach(input => {
      const r = parseInt(input.dataset.r);
      const c = parseInt(input.dataset.c);
      if (input.value.toUpperCase() === this.puzzle[r][c]) {
        input.classList.add('correct');
        input.classList.remove('wrong');
        correct++;
      } else {
        input.classList.add('wrong');
        input.classList.remove('correct');
      }
    });
    if (correct === inputs.length) {
      setTimeout(() => alert('Puzzle complete!'), 100);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new Crossword());
