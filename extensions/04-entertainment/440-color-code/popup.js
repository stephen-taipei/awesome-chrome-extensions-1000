// Color Code - Popup Script
class ColorCode {
  constructor() {
    this.colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    this.secret = [];
    this.guess = [null, null, null, null];
    this.selected = 0;
    this.attempts = 0;
    this.wins = 0;
    this.history = [];
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorCodeWins'], (r) => {
      this.wins = r.colorCodeWins || 0;
      document.getElementById('wins').textContent = this.wins;
    });
    this.renderPalette();
    document.getElementById('submitBtn').addEventListener('click', () => this.submit());
    this.newGame();
  }
  newGame() {
    this.secret = Array(4).fill(0).map(() => this.colors[Math.floor(Math.random() * this.colors.length)]);
    this.guess = [null, null, null, null];
    this.selected = 0;
    this.attempts = 0;
    this.history = [];
    document.getElementById('history').innerHTML = '';
    document.getElementById('attempts').textContent = '0';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    this.renderGuess();
    this.renderCurrentHints();
  }
  renderPalette() {
    const el = document.getElementById('palette');
    el.innerHTML = this.colors.map((c, i) =>
      `<div class="palette-color ${i === 0 ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`
    ).join('');
    el.querySelectorAll('.palette-color').forEach(pc => {
      pc.addEventListener('click', () => {
        el.querySelectorAll('.palette-color').forEach(p => p.classList.remove('selected'));
        pc.classList.add('selected');
        this.selected = pc.dataset.color;
      });
    });
    this.selected = this.colors[0];
  }
  renderGuess() {
    const el = document.getElementById('guess');
    el.innerHTML = this.guess.map((c, i) =>
      `<div class="peg ${c ? '' : 'empty'}" style="${c ? 'background:' + c : ''}" data-i="${i}"></div>`
    ).join('');
    el.querySelectorAll('.peg').forEach(peg => {
      peg.addEventListener('click', () => {
        const i = parseInt(peg.dataset.i);
        this.guess[i] = this.selected;
        this.renderGuess();
      });
    });
  }
  renderCurrentHints() {
    document.getElementById('currentHints').innerHTML = '<div class="hint"></div>'.repeat(4);
  }
  getHints(guess) {
    let exact = 0, partial = 0;
    const secretCopy = [...this.secret];
    const guessCopy = [...guess];
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        exact++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i]) {
        const j = secretCopy.indexOf(guessCopy[i]);
        if (j !== -1) {
          partial++;
          secretCopy[j] = null;
        }
      }
    }
    return { exact, partial };
  }
  submit() {
    if (this.guess.includes(null)) return;
    const hints = this.getHints(this.guess);
    this.history.push({ guess: [...this.guess], hints });
    this.attempts++;
    document.getElementById('attempts').textContent = this.attempts;
    this.renderHistory();
    if (hints.exact === 4) {
      this.wins++;
      chrome.storage.local.set({ colorCodeWins: this.wins });
      document.getElementById('wins').textContent = this.wins;
      document.getElementById('feedback').textContent = `🎉 Cracked in ${this.attempts} tries!`;
      document.getElementById('feedback').className = 'feedback win';
      setTimeout(() => this.newGame(), 2000);
    } else if (this.attempts >= 8) {
      document.getElementById('feedback').textContent = `💀 Code: ${this.secret.map(c => '●').join('')}`;
      document.getElementById('feedback').className = 'feedback lose';
      setTimeout(() => this.newGame(), 2000);
    } else {
      this.guess = [null, null, null, null];
      this.renderGuess();
    }
  }
  renderHistory() {
    const el = document.getElementById('history');
    el.innerHTML = this.history.map(h => `
      <div class="history-row">
        <div class="history-guess">${h.guess.map(c => `<div class="peg" style="background:${c}"></div>`).join('')}</div>
        <div class="hints">
          ${'<div class="hint exact"></div>'.repeat(h.hints.exact)}
          ${'<div class="hint partial"></div>'.repeat(h.hints.partial)}
          ${'<div class="hint"></div>'.repeat(4 - h.hints.exact - h.hints.partial)}
        </div>
      </div>
    `).join('');
    el.scrollTop = el.scrollHeight;
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorCode());
