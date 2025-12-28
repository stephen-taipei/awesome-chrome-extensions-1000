// Word Wheel - Popup Script
class WordWheel {
  constructor() {
    this.validWords = ['cat','car','cart','arc','art','rat','tar','act','at','trace','race','crate','acre','care','rate','tear','ate','eat','tea','are','ear','era'];
    this.letters = [];
    this.center = '';
    this.found = [];
    this.score = 0;
    this.init();
  }
  init() {
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.submit();
    });
    document.getElementById('newBtn').addEventListener('click', () => this.newWheel());
    this.newWheel();
  }
  newWheel() {
    const sets = [
      { letters: ['C','A','R','T','E','R','A','C'], center: 'A' },
      { letters: ['S','T','A','R','E','P','L','S'], center: 'A' },
      { letters: ['L','I','G','H','T','E','N','L'], center: 'I' },
      { letters: ['W','O','R','K','E','D','A','W'], center: 'O' },
      { letters: ['P','L','A','Y','E','R','S','P'], center: 'A' }
    ];
    const set = sets[Math.floor(Math.random() * sets.length)];
    this.letters = set.letters.slice(0, 8);
    this.center = set.center;
    this.found = [];
    this.score = 0;
    this.render();
    this.updateStats();
    document.getElementById('input').value = '';
    document.getElementById('message').textContent = '';
    document.getElementById('words').textContent = '';
  }
  render() {
    const wheel = document.getElementById('wheel');
    wheel.innerHTML = '';
    const positions = [
      { x: 60, y: 0 }, { x: 110, y: 25 }, { x: 120, y: 70 }, { x: 100, y: 115 },
      { x: 50, y: 120 }, { x: 0, y: 95 }, { x: -10, y: 50 }, { x: 20, y: 10 }
    ];
    this.letters.forEach((letter, i) => {
      if (i < 8) {
        const div = document.createElement('div');
        div.className = 'letter';
        div.textContent = letter;
        div.style.left = positions[i].x + 'px';
        div.style.top = positions[i].y + 'px';
        wheel.appendChild(div);
      }
    });
    const centerDiv = document.createElement('div');
    centerDiv.className = 'letter center';
    centerDiv.textContent = this.center;
    wheel.appendChild(centerDiv);
  }
  submit() {
    const input = document.getElementById('input');
    const word = input.value.toUpperCase();
    const msg = document.getElementById('message');
    input.value = '';
    if (word.length < 3) {
      msg.textContent = 'Too short (3+ letters)';
      msg.className = 'message error';
      return;
    }
    if (!word.includes(this.center)) {
      msg.textContent = 'Must use center letter';
      msg.className = 'message error';
      return;
    }
    const available = [...this.letters, this.center];
    for (const char of word) {
      const idx = available.indexOf(char);
      if (idx === -1) {
        msg.textContent = 'Invalid letters';
        msg.className = 'message error';
        return;
      }
      available.splice(idx, 1);
    }
    if (this.found.includes(word)) {
      msg.textContent = 'Already found';
      msg.className = 'message error';
      return;
    }
    this.found.push(word);
    this.score += word.length * 10;
    msg.textContent = `+${word.length * 10} points!`;
    msg.className = 'message success';
    document.getElementById('words').textContent = this.found.join(', ');
    this.updateStats();
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('wordCount').textContent = this.found.length;
  }
}
document.addEventListener('DOMContentLoaded', () => new WordWheel());
