// Word Ladder - Popup Script
class WordLadder {
  constructor() {
    this.puzzles = [
      { start: 'COLD', target: 'WARM', path: ['CORD', 'WORD', 'WORM'] },
      { start: 'HEAD', target: 'TAIL', path: ['HEAL', 'TEAL', 'TELL', 'TALL'] },
      { start: 'LOVE', target: 'HATE', path: ['LAVE', 'HAVE'] },
      { start: 'SLOW', target: 'FAST', path: ['SLOT', 'SOOT', 'FOOT', 'FART'] },
      { start: 'DARK', target: 'LITE', path: ['DANK', 'LINK', 'LINE'] }
    ];
    this.current = null;
    this.ladder = [];
    this.steps = 0;
    this.wins = 0;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['ladderWins']);
    this.wins = data.ladderWins || 0;
    document.getElementById('wins').textContent = this.wins;
    document.getElementById('newBtn').addEventListener('click', () => this.newPuzzle());
    document.getElementById('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submit();
    });
    this.newPuzzle();
  }
  newPuzzle() {
    this.current = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    this.ladder = [];
    this.steps = 0;
    document.getElementById('start').textContent = this.current.start;
    document.getElementById('target').textContent = this.current.target;
    document.getElementById('steps').textContent = 0;
    document.getElementById('input').value = '';
    document.getElementById('message').textContent = '';
    this.render();
  }
  submit() {
    const input = document.getElementById('input').value.toUpperCase().trim();
    const msg = document.getElementById('message');
    if (input.length !== 4) {
      msg.textContent = 'Enter a 4-letter word';
      msg.className = 'message error';
      return;
    }
    const lastWord = this.ladder.length ? this.ladder[this.ladder.length - 1] : this.current.start;
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      if (input[i] !== lastWord[i]) diff++;
    }
    if (diff !== 1) {
      msg.textContent = 'Change exactly one letter!';
      msg.className = 'message error';
      return;
    }
    this.ladder.push(input);
    this.steps++;
    document.getElementById('steps').textContent = this.steps;
    document.getElementById('input').value = '';
    if (input === this.current.target) {
      msg.textContent = `🎉 Solved in ${this.steps} steps!`;
      msg.className = 'message success';
      this.wins++;
      chrome.storage.local.set({ ladderWins: this.wins });
      document.getElementById('wins').textContent = this.wins;
    } else {
      msg.textContent = '';
    }
    this.render();
  }
  render() {
    const ladderEl = document.getElementById('ladder');
    ladderEl.innerHTML = this.ladder.map(w => `<div class="step">${w}</div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new WordLadder());
