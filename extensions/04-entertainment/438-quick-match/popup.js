// Quick Match - Popup Script
class QuickMatch {
  constructor() {
    this.score = 0;
    this.pairs = 0;
    this.first = null;
    this.locked = false;
    this.timeLeft = 100;
    this.interval = null;
    this.emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎹', '🎸'];
    this.init();
  }
  init() {
    chrome.storage.local.get(['quickMatchScore'], (r) => {
      this.score = r.quickMatchScore || 0;
      document.getElementById('score').textContent = this.score;
    });
    this.newGame();
  }
  newGame() {
    clearInterval(this.interval);
    this.pairs = 0;
    this.first = null;
    this.locked = false;
    this.timeLeft = 100;
    document.getElementById('pairs').textContent = '0';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    const cards = [...this.emojis, ...this.emojis].sort(() => Math.random() - 0.5);
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    cards.forEach((emoji, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.emoji = emoji;
      card.dataset.index = i;
      card.textContent = '';
      card.addEventListener('click', () => this.flip(card));
      grid.appendChild(card);
    });
    this.interval = setInterval(() => this.tick(), 100);
  }
  tick() {
    this.timeLeft -= 1;
    document.getElementById('timerFill').style.width = this.timeLeft + '%';
    if (this.timeLeft <= 0) {
      clearInterval(this.interval);
      document.getElementById('feedback').textContent = '⏰ Time up!';
      document.getElementById('feedback').className = 'feedback lose';
      this.locked = true;
      setTimeout(() => this.newGame(), 1500);
    }
  }
  flip(card) {
    if (this.locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    card.textContent = card.dataset.emoji;
    if (!this.first) {
      this.first = card;
    } else {
      this.locked = true;
      if (this.first.dataset.emoji === card.dataset.emoji) {
        this.first.classList.add('matched');
        card.classList.add('matched');
        this.pairs++;
        document.getElementById('pairs').textContent = this.pairs;
        this.first = null;
        this.locked = false;
        if (this.pairs === 8) {
          clearInterval(this.interval);
          const bonus = Math.floor(this.timeLeft);
          this.score += 100 + bonus;
          chrome.storage.local.set({ quickMatchScore: this.score });
          document.getElementById('score').textContent = this.score;
          document.getElementById('feedback').textContent = `🎉 You won! +${100 + bonus}`;
          document.getElementById('feedback').className = 'feedback win';
          setTimeout(() => this.newGame(), 2000);
        }
      } else {
        setTimeout(() => {
          this.first.classList.remove('flipped');
          this.first.textContent = '';
          card.classList.remove('flipped');
          card.textContent = '';
          this.first = null;
          this.locked = false;
        }, 500);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new QuickMatch());
