// Spelling Bee - Popup Script
class SpellingBee {
  constructor() {
    this.words = ['beautiful', 'necessary', 'accommodate', 'rhythm', 'separate', 'definitely', 'occurrence', 'privilege', 'embarrass', 'conscience', 'maintenance', 'millennium', 'recommend', 'restaurant', 'questionnaire', 'occasionally', 'government', 'independent', 'environment', 'pronunciation'];
    this.currentWord = '';
    this.score = 0;
    this.best = 0;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['spellingBest']);
    this.best = data.spellingBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('speakBtn').addEventListener('click', () => this.speak());
    document.getElementById('skipBtn').addEventListener('click', () => this.nextWord());
    document.getElementById('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.check();
    });
    this.nextWord();
  }
  nextWord() {
    this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
    document.getElementById('input').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('prompt').textContent = `Spell: "${this.currentWord.length}" letters`;
    this.speak();
  }
  speak() {
    const utterance = new SpeechSynthesisUtterance(this.currentWord);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }
  check() {
    const input = document.getElementById('input').value.trim().toLowerCase();
    const feedback = document.getElementById('feedback');
    if (input === this.currentWord) {
      feedback.textContent = '✓ Correct!';
      feedback.className = 'feedback correct';
      this.score++;
      document.getElementById('score').textContent = this.score;
      if (this.score > this.best) {
        this.best = this.score;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ spellingBest: this.best });
      }
      setTimeout(() => this.nextWord(), 1000);
    } else {
      feedback.textContent = `✗ It was "${this.currentWord}"`;
      feedback.className = 'feedback wrong';
      this.score = 0;
      document.getElementById('score').textContent = 0;
      setTimeout(() => this.nextWord(), 2000);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new SpellingBee());
