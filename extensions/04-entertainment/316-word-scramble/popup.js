// Word Scramble - Popup Script
class WordScramble {
  constructor() {
    this.words = ['APPLE','BANANA','ORANGE','GRAPE','CHERRY','MANGO','LEMON','PEACH','MELON','BERRY','COMPUTER','KEYBOARD','MONITOR','MOUSE','SCREEN','BROWSER','WINDOW','BUTTON','SCROLL','CURSOR','PYTHON','JAVASCRIPT','CODING','FUNCTION','VARIABLE','ARRAY','STRING','NUMBER','OBJECT','CLASS'];
    this.currentWord = '';
    this.score = 0;
    this.init();
  }
  init() {
    document.getElementById('submitBtn').addEventListener('click', () => this.checkAnswer());
    document.getElementById('answer').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.checkAnswer();
    });
    document.getElementById('skipBtn').addEventListener('click', () => this.skip());
    this.loadScore();
    this.newWord();
  }
  scramble(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('') === word ? this.scramble(word) : arr.join('');
  }
  newWord() {
    this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
    document.getElementById('scrambled').textContent = this.scramble(this.currentWord);
    document.getElementById('answer').value = '';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    document.getElementById('answer').focus();
  }
  checkAnswer() {
    const answer = document.getElementById('answer').value.toUpperCase().trim();
    const msg = document.getElementById('message');
    if (answer === this.currentWord) {
      this.score++;
      this.updateScore();
      msg.textContent = 'Correct!';
      msg.className = 'message correct';
      setTimeout(() => this.newWord(), 1000);
    } else {
      msg.textContent = 'Try again!';
      msg.className = 'message wrong';
    }
  }
  skip() {
    document.getElementById('message').textContent = `The word was: ${this.currentWord}`;
    document.getElementById('message').className = 'message wrong';
    setTimeout(() => this.newWord(), 1500);
  }
  updateScore() {
    document.getElementById('score').textContent = this.score;
    this.saveScore();
  }
  saveScore() { chrome.storage.local.set({ scrambleScore: this.score }); }
  loadScore() {
    chrome.storage.local.get(['scrambleScore'], (r) => {
      this.score = r.scrambleScore || 0;
      this.updateScore();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new WordScramble());
