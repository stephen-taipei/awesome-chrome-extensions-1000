// Word Scramble - Popup Script
class WordScramble {
  constructor() {
    this.words = ['APPLE','BEACH','CHAIR','DANCE','EAGLE','FLAME','GRAPE','HORSE','IMAGE','JUICE','KNIFE','LEMON','MUSIC','NIGHT','OCEAN','PIANO','QUEEN','RIVER','STORM','TIGER'];
    this.current = '';
    this.scrambled = '';
    this.score = 0;
    this.streak = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['scrambleScore'], (r) => {
      this.score = r.scrambleScore || 0;
      this.updateStats();
    });
    document.getElementById('answer').addEventListener('input', (e) => this.check(e.target.value));
    document.getElementById('skipBtn').addEventListener('click', () => this.skip());
    this.newWord();
  }
  newWord() {
    this.current = this.words[Math.floor(Math.random() * this.words.length)];
    this.scrambled = this.shuffle(this.current);
    while (this.scrambled === this.current) {
      this.scrambled = this.shuffle(this.current);
    }
    this.render();
    document.getElementById('answer').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  shuffle(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  }
  render() {
    const el = document.getElementById('scrambled');
    el.innerHTML = '';
    this.scrambled.split('').forEach(letter => {
      const div = document.createElement('div');
      div.className = 'letter';
      div.textContent = letter;
      el.appendChild(div);
    });
  }
  check(guess) {
    if (guess.toUpperCase() === this.current) {
      this.score += 10 + this.streak * 2;
      this.streak++;
      chrome.storage.local.set({ scrambleScore: this.score });
      document.getElementById('feedback').textContent = 'Correct!';
      document.getElementById('feedback').className = 'feedback correct';
      this.updateStats();
      setTimeout(() => this.newWord(), 800);
    }
  }
  skip() {
    this.streak = 0;
    document.getElementById('feedback').textContent = `It was: ${this.current}`;
    document.getElementById('feedback').className = 'feedback wrong';
    this.updateStats();
    setTimeout(() => this.newWord(), 1500);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
  }
}
document.addEventListener('DOMContentLoaded', () => new WordScramble());
