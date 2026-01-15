// Letter Drop - Popup Script
class LetterDrop {
  constructor() {
    this.words = ['CAT','DOG','SUN','HAT','RUN','FUN','RED','BIG','TOP','CUP'];
    this.current = '';
    this.collected = '';
    this.score = 0;
    this.lives = 3;
    this.running = false;
    this.interval = null;
    this.init();
  }
  init() {
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  start() {
    this.current = this.words[Math.floor(Math.random() * this.words.length)];
    this.collected = '';
    this.lives = 3;
    this.running = true;
    document.getElementById('word').textContent = this.current;
    document.getElementById('collected').textContent = '';
    document.getElementById('game').innerHTML = '';
    this.updateStats();
    this.interval = setInterval(() => this.spawnLetter(), 800);
  }
  spawnLetter() {
    if (!this.running) return;
    const game = document.getElementById('game');
    const needed = this.current[this.collected.length];
    const isNeeded = Math.random() < 0.4;
    const letter = isNeeded ? needed : String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const el = document.createElement('div');
    el.className = 'letter';
    el.textContent = letter;
    el.style.left = Math.floor(Math.random() * 224) + 'px';
    el.style.animationDuration = (2 + Math.random()) + 's';
    el.addEventListener('click', () => this.catch(letter, el));
    el.addEventListener('animationend', () => {
      if (el.parentNode) el.remove();
    });
    game.appendChild(el);
  }
  catch(letter, el) {
    el.remove();
    const needed = this.current[this.collected.length];
    if (letter === needed) {
      this.collected += letter;
      document.getElementById('collected').textContent = this.collected;
      if (this.collected === this.current) {
        this.score += this.current.length * 10;
        this.updateStats();
        setTimeout(() => this.nextWord(), 500);
      }
    } else {
      this.lives--;
      this.updateStats();
      if (this.lives <= 0) this.gameOver();
    }
  }
  nextWord() {
    this.current = this.words[Math.floor(Math.random() * this.words.length)];
    this.collected = '';
    document.getElementById('word').textContent = this.current;
    document.getElementById('collected').textContent = '';
  }
  gameOver() {
    this.running = false;
    clearInterval(this.interval);
    document.getElementById('game').innerHTML = '<div style="padding:60px;color:#ef4444;font-size:18px;font-weight:bold;">Game Over!</div>';
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
  }
}
document.addEventListener('DOMContentLoaded', () => new LetterDrop());
