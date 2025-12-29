// Emoji Puzzle - Popup Script
class EmojiPuzzle {
  constructor() {
    this.puzzles = [
      { emojis: '🌙⭐', answer: 'NIGHT SKY', hint: 'What you see after dark' },
      { emojis: '☀️🌻', answer: 'SUNFLOWER', hint: 'A tall yellow flower' },
      { emojis: '🔥🚒', answer: 'FIRE TRUCK', hint: 'Emergency vehicle' },
      { emojis: '🍎📚', answer: 'SCHOOL', hint: 'Where kids learn' },
      { emojis: '🎂🎈', answer: 'BIRTHDAY', hint: 'Annual celebration' },
      { emojis: '❄️⛄', answer: 'SNOWMAN', hint: 'Winter creation' },
      { emojis: '🌧️🌈', answer: 'RAINBOW', hint: 'After the storm' },
      { emojis: '🎄🎁', answer: 'CHRISTMAS', hint: 'December holiday' },
      { emojis: '🐝🍯', answer: 'HONEY', hint: 'Sweet and sticky' },
      { emojis: '🏠🔑', answer: 'HOME', hint: 'Where you live' },
      { emojis: '✈️🌴', answer: 'VACATION', hint: 'Time off to travel' },
      { emojis: '🎬🍿', answer: 'MOVIE', hint: 'Entertainment you watch' }
    ];
    this.current = null;
    this.score = 0;
    this.streak = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['emojiPuzzleScore'], (r) => {
      if (r.emojiPuzzleScore) this.score = r.emojiPuzzleScore;
      this.updateStats();
    });
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.check();
    });
    document.getElementById('skipBtn').addEventListener('click', () => this.skip());
    this.newPuzzle();
  }
  newPuzzle() {
    this.current = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    document.getElementById('emojis').textContent = this.current.emojis;
    document.getElementById('hint').textContent = this.current.hint;
    document.getElementById('input').value = '';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
  }
  check() {
    const input = document.getElementById('input').value.toUpperCase().trim();
    const answer = this.current.answer.toUpperCase();
    if (input === answer || input === answer.replace(' ', '')) {
      this.streak++;
      const pts = 20 + this.streak * 5;
      this.score += pts;
      chrome.storage.local.set({ emojiPuzzleScore: this.score });
      document.getElementById('message').textContent = `Correct! +${pts}`;
      document.getElementById('message').className = 'message success';
      this.updateStats();
      setTimeout(() => this.newPuzzle(), 1200);
    } else {
      document.getElementById('message').textContent = 'Try again!';
      document.getElementById('message').className = 'message error';
    }
  }
  skip() {
    this.streak = 0;
    document.getElementById('message').textContent = `Answer: ${this.current.answer}`;
    document.getElementById('message').className = 'message error';
    this.updateStats();
    setTimeout(() => this.newPuzzle(), 1500);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
  }
}
document.addEventListener('DOMContentLoaded', () => new EmojiPuzzle());
