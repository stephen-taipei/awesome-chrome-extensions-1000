// Find Pair - Popup Script
class FindPair {
  constructor() {
    this.emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭', '🍍', '🥥', '🍌'];
    this.items = [];
    this.pairEmoji = '';
    this.score = 0;
    this.best = 0;
    this.timeLeft = 100;
    this.timer = null;
    this.playing = false;
    this.init();
  }
  init() {
    chrome.storage.local.get(['findPairBest'], (r) => {
      this.best = r.findPairBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    document.getElementById('startBtn').addEventListener('click', () => this.start());
  }
  start() {
    this.score = 0;
    this.timeLeft = 100;
    this.playing = true;
    document.getElementById('score').textContent = '0';
    document.getElementById('message').textContent = '';
    document.getElementById('startBtn').disabled = true;
    this.newRound();
    this.runTimer();
  }
  newRound() {
    const shuffled = [...this.emojis].sort(() => Math.random() - 0.5);
    this.pairEmoji = shuffled[0];
    this.items = shuffled.slice(0, 7);
    const pairIdx = Math.floor(Math.random() * 8);
    this.items.splice(pairIdx, 0, this.pairEmoji);
    this.render();
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = this.items.map((emoji, i) =>
      `<button class="item" data-idx="${i}">${emoji}</button>`
    ).join('');
    grid.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => this.select(parseInt(item.dataset.idx)));
    });
  }
  select(idx) {
    if (!this.playing) return;
    const item = document.querySelector(`[data-idx="${idx}"]`);
    if (this.items[idx] === this.pairEmoji) {
      const other = this.items.findIndex((e, i) => e === this.pairEmoji && i !== idx);
      item.classList.add('correct');
      document.querySelector(`[data-idx="${other}"]`).classList.add('correct');
      this.score++;
      document.getElementById('score').textContent = this.score;
      this.timeLeft = Math.min(100, this.timeLeft + 10);
      setTimeout(() => this.newRound(), 300);
    } else {
      item.classList.add('wrong');
      this.timeLeft -= 15;
      setTimeout(() => item.classList.remove('wrong'), 300);
    }
  }
  runTimer() {
    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      document.getElementById('timerFill').style.width = Math.max(0, this.timeLeft) + '%';
      if (this.timeLeft <= 0) this.end();
    }, 300);
  }
  end() {
    clearInterval(this.timer);
    this.playing = false;
    document.getElementById('message').textContent = 'Game Over! Score: ' + this.score;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = 'Play Again';
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ findPairBest: this.best });
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new FindPair());
