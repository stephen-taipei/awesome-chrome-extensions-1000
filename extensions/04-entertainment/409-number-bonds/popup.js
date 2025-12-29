// Number Bonds - Popup Script
class NumberBonds {
  constructor() {
    this.target = 10;
    this.num1 = 0;
    this.num2 = 0;
    this.missing = 1;
    this.answer = 0;
    this.score = 0;
    this.streak = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['bondsScore'], (r) => {
      if (r.bondsScore) this.score = r.bondsScore;
      this.updateStats();
    });
    document.getElementById('mode10').addEventListener('click', () => this.setMode(10));
    document.getElementById('mode20').addEventListener('click', () => this.setMode(20));
    this.newRound();
  }
  setMode(t) {
    this.target = t;
    document.getElementById('mode10').classList.toggle('active', t === 10);
    document.getElementById('mode20').classList.toggle('active', t === 20);
    document.getElementById('target').textContent = t;
    this.newRound();
  }
  newRound() {
    this.num1 = Math.floor(Math.random() * this.target);
    this.num2 = this.target - this.num1;
    this.missing = Math.random() < 0.5 ? 1 : 2;
    this.answer = this.missing === 1 ? this.num1 : this.num2;
    document.getElementById('num1').textContent = this.missing === 1 ? '?' : this.num1;
    document.getElementById('num1').classList.toggle('missing', this.missing === 1);
    document.getElementById('num2').textContent = this.missing === 2 ? '?' : this.num2;
    document.getElementById('num2').classList.toggle('missing', this.missing === 2);
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    const options = [this.answer];
    while (options.length < 4) {
      const n = Math.floor(Math.random() * (this.target + 1));
      if (!options.includes(n)) options.push(n);
    }
    options.sort(() => Math.random() - 0.5);
    const container = document.getElementById('options');
    container.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.guess(opt, btn));
      container.appendChild(btn);
    });
  }
  guess(opt, btn) {
    const btns = document.querySelectorAll('.option');
    btns.forEach(b => b.disabled = true);
    if (opt === this.answer) {
      btn.classList.add('correct');
      this.streak++;
      this.score += 5 + this.streak;
      chrome.storage.local.set({ bondsScore: this.score });
      document.getElementById('message').textContent = `Correct! +${5 + this.streak}`;
      document.getElementById('message').className = 'message success';
    } else {
      btn.classList.add('wrong');
      btns.forEach(b => { if (parseInt(b.textContent) === this.answer) b.classList.add('correct'); });
      this.streak = 0;
      document.getElementById('message').textContent = `It was ${this.answer}`;
      document.getElementById('message').className = 'message error';
    }
    this.updateStats();
    setTimeout(() => this.newRound(), 1000);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
  }
}
document.addEventListener('DOMContentLoaded', () => new NumberBonds());
