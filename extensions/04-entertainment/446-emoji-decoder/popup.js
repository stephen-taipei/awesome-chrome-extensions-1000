// Emoji Decoder - Popup Script
class EmojiDecoder {
  constructor() {
    this.puzzles = [
      { emoji: '🌊🦁👑', answer: 'sea lion king' }, { emoji: '🔥🪵', answer: 'firewood' },
      { emoji: '☀️🌻', answer: 'sunflower' }, { emoji: '🌈🦄', answer: 'rainbow unicorn' },
      { emoji: '❄️👸', answer: 'frozen' }, { emoji: '🎃👻', answer: 'halloween' },
      { emoji: '🍕🏠', answer: 'pizza hut' }, { emoji: '⭐🔫', answer: 'star wars' },
      { emoji: '🦇🧔', answer: 'batman' }, { emoji: '🕷️🧔', answer: 'spiderman' },
      { emoji: '🧊🧊👶', answer: 'ice ice baby' }, { emoji: '🔥🏃', answer: 'running hot' },
      { emoji: '🌙🚶', answer: 'moonwalk' }, { emoji: '☕🛳️', answer: 'coffee ship' },
      { emoji: '🎸🦸', answer: 'guitar hero' }, { emoji: '🍎📱', answer: 'apple phone' },
      { emoji: '🏠🔑', answer: 'house key' }, { emoji: '🌍🗓️', answer: 'earth day' },
      { emoji: '🎂🎉', answer: 'birthday party' }, { emoji: '🚗🏁', answer: 'car race' }
    ];
    this.current = null;
    this.score = 0;
    this.streak = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['emojiDecoderScore'], (r) => {
      this.score = r.emojiDecoderScore || 0;
      document.getElementById('score').textContent = this.score;
    });
    document.getElementById('submitBtn').addEventListener('click', () => this.submit());
    document.getElementById('skipBtn').addEventListener('click', () => this.skip());
    document.getElementById('input').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.submit(); });
    this.newPuzzle();
  }
  newPuzzle() {
    this.current = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    document.getElementById('emoji').textContent = this.current.emoji;
    document.getElementById('input').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  submit() {
    const guess = document.getElementById('input').value.toLowerCase().trim();
    const fb = document.getElementById('feedback');
    if (guess === this.current.answer.toLowerCase()) {
      this.streak++;
      const bonus = 10 + this.streak * 5;
      this.score += bonus;
      chrome.storage.local.set({ emojiDecoderScore: this.score });
      document.getElementById('score').textContent = this.score;
      document.getElementById('streak').textContent = this.streak;
      fb.textContent = `✓ Correct! +${bonus}`;
      fb.className = 'feedback correct';
      setTimeout(() => this.newPuzzle(), 1000);
    } else {
      fb.textContent = '✗ Try again!';
      fb.className = 'feedback wrong';
    }
  }
  skip() {
    this.streak = 0;
    document.getElementById('streak').textContent = '0';
    const fb = document.getElementById('feedback');
    fb.textContent = `Answer: ${this.current.answer}`;
    fb.className = 'feedback skip';
    setTimeout(() => this.newPuzzle(), 1500);
  }
}
document.addEventListener('DOMContentLoaded', () => new EmojiDecoder());
