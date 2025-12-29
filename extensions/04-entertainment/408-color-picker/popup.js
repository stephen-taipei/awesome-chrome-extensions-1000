// Color Picker - Popup Script
class ColorPicker {
  constructor() {
    this.colors = [
      { name: 'Red', hex: '#ef4444' },
      { name: 'Orange', hex: '#f97316' },
      { name: 'Yellow', hex: '#eab308' },
      { name: 'Green', hex: '#22c55e' },
      { name: 'Blue', hex: '#3b82f6' },
      { name: 'Purple', hex: '#a855f7' },
      { name: 'Pink', hex: '#ec4899' },
      { name: 'Cyan', hex: '#06b6d4' },
      { name: 'Teal', hex: '#14b8a6' },
      { name: 'Indigo', hex: '#6366f1' },
      { name: 'Rose', hex: '#f43f5e' },
      { name: 'Amber', hex: '#f59e0b' }
    ];
    this.current = null;
    this.score = 0;
    this.best = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorPickerBest'], (r) => {
      if (r.colorPickerBest) this.best = r.colorPickerBest;
      this.updateStats();
    });
    this.newRound();
  }
  newRound() {
    this.current = this.colors[Math.floor(Math.random() * this.colors.length)];
    document.getElementById('colorBox').style.background = this.current.hex;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    const options = [this.current];
    while (options.length < 4) {
      const c = this.colors[Math.floor(Math.random() * this.colors.length)];
      if (!options.find(o => o.name === c.name)) options.push(c);
    }
    options.sort(() => Math.random() - 0.5);
    const container = document.getElementById('options');
    container.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.textContent = opt.name;
      btn.addEventListener('click', () => this.guess(opt, btn));
      container.appendChild(btn);
    });
  }
  guess(opt, btn) {
    const btns = document.querySelectorAll('.option');
    btns.forEach(b => b.disabled = true);
    if (opt.name === this.current.name) {
      btn.classList.add('correct');
      this.score += 10;
      if (this.score > this.best) {
        this.best = this.score;
        chrome.storage.local.set({ colorPickerBest: this.best });
      }
      document.getElementById('message').textContent = 'Correct! +10';
      document.getElementById('message').className = 'message success';
    } else {
      btn.classList.add('wrong');
      btns.forEach(b => { if (b.textContent === this.current.name) b.classList.add('correct'); });
      this.score = Math.max(0, this.score - 5);
      document.getElementById('message').textContent = `Wrong! It was ${this.current.name}`;
      document.getElementById('message').className = 'message error';
    }
    this.updateStats();
    setTimeout(() => this.newRound(), 1200);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('best').textContent = this.best;
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorPicker());
