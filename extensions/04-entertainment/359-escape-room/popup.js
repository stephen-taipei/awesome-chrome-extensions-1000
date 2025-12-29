// Escape Room - Popup Script
class EscapeRoom {
  constructor() {
    this.puzzles = [
      { emoji: '🔢', hint: 'Sum of: 15 + 27 + 8', answer: '50' },
      { emoji: '🔤', hint: 'First letters: Apple, Cat, Echo', answer: 'ACE' },
      { emoji: '🎨', hint: 'Colors: Red + Blue = ?', answer: 'PURPLE' },
      { emoji: '⏰', hint: 'Minutes in 2 hours', answer: '120' },
      { emoji: '🔑', hint: 'Reverse: 4321', answer: '1234' }
    ];
    this.currentRoom = 0;
    this.escapes = 0;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['escapeWins']);
    this.escapes = data.escapeWins || 0;
    document.getElementById('escapes').textContent = this.escapes;
    document.getElementById('submitBtn').addEventListener('click', () => this.submit());
    document.getElementById('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submit();
    });
    this.render();
  }
  submit() {
    const input = document.getElementById('input').value.toUpperCase().trim();
    const msg = document.getElementById('message');
    const puzzle = this.puzzles[this.currentRoom];
    if (input === puzzle.answer.toUpperCase()) {
      msg.textContent = '✓ Correct! Door unlocked!';
      msg.className = 'message success';
      this.currentRoom++;
      document.getElementById('input').value = '';
      if (this.currentRoom >= this.puzzles.length) {
        this.escapes++;
        chrome.storage.local.set({ escapeWins: this.escapes });
        document.getElementById('escapes').textContent = this.escapes;
        msg.textContent = '🎉 You escaped! Starting new game...';
        setTimeout(() => {
          this.currentRoom = 0;
          this.shufflePuzzles();
          msg.textContent = '';
          this.render();
        }, 2000);
      } else {
        setTimeout(() => {
          msg.textContent = '';
          this.render();
        }, 1000);
      }
    } else {
      msg.textContent = '✗ Wrong code! Try again.';
      msg.className = 'message error';
    }
  }
  shufflePuzzles() {
    this.puzzles.sort(() => Math.random() - 0.5);
  }
  render() {
    const puzzle = this.puzzles[this.currentRoom];
    document.getElementById('room').textContent = this.currentRoom + 1;
    document.getElementById('room-display').textContent = puzzle.emoji;
    document.getElementById('puzzle').innerHTML = `<div class="hint">${puzzle.hint}</div><div class="clue">????</div>`;
  }
}
document.addEventListener('DOMContentLoaded', () => new EscapeRoom());
