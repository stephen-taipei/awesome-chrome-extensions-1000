// Color Guess - Popup Script
class ColorGuess {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.correctColor = '';
    this.init();
  }
  init() {
    this.loadScore();
    this.newRound();
  }
  randomColor() {
    const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    return '#' + hex.toUpperCase();
  }
  newRound() {
    this.correctColor = this.randomColor();
    const colors = [this.correctColor];
    while (colors.length < 4) {
      const c = this.randomColor();
      if (!colors.includes(c)) colors.push(c);
    }
    colors.sort(() => Math.random() - 0.5);
    document.getElementById('hexCode').textContent = this.correctColor;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = colors.map(c => `<button class="option" data-color="${c}" style="background:${c}"></button>`).join('');
    optionsEl.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => this.guess(btn.dataset.color));
    });
  }
  guess(color) {
    const buttons = document.querySelectorAll('.option');
    buttons.forEach(b => b.disabled = true);
    const msg = document.getElementById('message');
    if (color === this.correctColor) {
      this.score++;
      this.streak++;
      msg.textContent = `Correct! +1 point`;
      msg.className = 'message correct';
      document.querySelector(`[data-color="${color}"]`).classList.add('correct');
    } else {
      this.streak = 0;
      msg.textContent = `Wrong! The answer was ${this.correctColor}`;
      msg.className = 'message wrong';
      document.querySelector(`[data-color="${color}"]`).classList.add('wrong');
      document.querySelector(`[data-color="${this.correctColor}"]`).classList.add('correct');
    }
    this.updateScore();
    this.saveScore();
    setTimeout(() => this.newRound(), 1500);
  }
  updateScore() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
  }
  saveScore() { chrome.storage.local.set({ colorGuessScore: { score: this.score, streak: this.streak } }); }
  loadScore() {
    chrome.storage.local.get(['colorGuessScore'], (r) => {
      if (r.colorGuessScore) {
        this.score = r.colorGuessScore.score || 0;
        this.streak = r.colorGuessScore.streak || 0;
        this.updateScore();
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorGuess());
