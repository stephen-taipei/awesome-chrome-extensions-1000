// Word Anagram - Popup Script
class WordAnagram {
  constructor() {
    this.words = ['PUZZLE','CHROME','BRAIN','TIGER','OCEAN','MUSIC','SPACE','DREAM','LIGHT','STORM','MAGIC','POWER','SWIFT','FLAME','WATER','EARTH','CLOUD','BRAVE','SPARK','GHOST'];
    this.current = '';
    this.scrambled = '';
    this.score = 0;
    this.streak = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['anagramScore'], (r) => {
      if (r.anagramScore) this.score = r.anagramScore;
      this.updateStats();
    });
    document.getElementById('input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.check();
    });
    document.getElementById('skipBtn').addEventListener('click', () => this.skip());
    this.newWord();
  }
  newWord() {
    this.current = this.words[Math.floor(Math.random() * this.words.length)];
    this.scrambled = this.shuffle(this.current);
    while (this.scrambled === this.current) this.scrambled = this.shuffle(this.current);
    this.render();
    document.getElementById('input').value = '';
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
  }
  shuffle(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }
  render() {
    const container = document.getElementById('scrambled');
    container.innerHTML = '';
    this.scrambled.split('').forEach(char => {
      const div = document.createElement('div');
      div.className = 'letter';
      div.textContent = char;
      container.appendChild(div);
    });
  }
  check() {
    const input = document.getElementById('input').value.toUpperCase();
    const msg = document.getElementById('message');
    if (input === this.current) {
      this.streak++;
      const pts = 10 + (this.streak * 2);
      this.score += pts;
      chrome.storage.local.set({ anagramScore: this.score });
      msg.textContent = `Correct! +${pts} points`;
      msg.className = 'message success';
      this.updateStats();
      setTimeout(() => this.newWord(), 1000);
    } else {
      msg.textContent = 'Try again!';
      msg.className = 'message error';
    }
  }
  skip() {
    this.streak = 0;
    document.getElementById('message').textContent = `Answer: ${this.current}`;
    document.getElementById('message').className = 'message error';
    this.updateStats();
    setTimeout(() => this.newWord(), 1500);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
  }
}
document.addEventListener('DOMContentLoaded', () => new WordAnagram());
