// Letter Scramble - Popup Script
class LetterScramble {
  constructor() {
    this.words = ['APPLE', 'BRAIN', 'CHESS', 'DRIVE', 'EARTH', 'FLAME', 'GRAPE', 'HEART', 'IMAGE', 'JUICE', 'KNIFE', 'LEMON', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'STORM', 'TIGER', 'ULTRA', 'VOICE', 'WATER', 'YOUTH', 'ZEBRA', 'BEACH', 'CLOUD', 'DREAM', 'EAGLE', 'FRESH'];
    this.currentWord = '';
    this.score = 0;
    this.best = 0;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['scrambleBest'], (r) => {
      this.best = r.scrambleBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('skipBtn').addEventListener('click', () => this.skip());
    document.getElementById('input').addEventListener('input', (e) => this.check(e));
    document.getElementById('skipBtn').disabled = true;
  }
  start() {
    this.score = 0;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    document.getElementById('input').value = '';
    document.getElementById('input').disabled = false;
    document.getElementById('skipBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Playing...';
    document.getElementById('startBtn').disabled = true;
    this.newWord();
    document.getElementById('input').focus();
  }
  newWord() {
    this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
    const scrambled = this.scramble(this.currentWord);
    document.getElementById('scrambled').textContent = scrambled;
    document.getElementById('input').value = '';
  }
  scramble(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('') === word ? this.scramble(word) : arr.join('');
  }
  check(e) {
    if (!this.playing) return;
    const guess = e.target.value.toUpperCase();
    if (guess === this.currentWord) {
      this.score++;
      document.getElementById('score').textContent = this.score;
      document.getElementById('message').textContent = '✓ Correct!';
      document.getElementById('message').className = 'message correct';
      if (this.score > this.best) {
        this.best = this.score;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ scrambleBest: this.best });
      }
      setTimeout(() => {
        document.getElementById('message').textContent = '';
        this.newWord();
      }, 500);
    }
  }
  skip() {
    if (!this.playing) return;
    document.getElementById('message').textContent = 'Was: ' + this.currentWord;
    document.getElementById('message').className = 'message wrong';
    this.end();
  }
  end() {
    this.playing = false;
    document.getElementById('input').disabled = true;
    document.getElementById('skipBtn').disabled = true;
    document.getElementById('startBtn').textContent = 'Play Again';
    document.getElementById('startBtn').disabled = false;
  }
}
document.addEventListener('DOMContentLoaded', () => new LetterScramble());
