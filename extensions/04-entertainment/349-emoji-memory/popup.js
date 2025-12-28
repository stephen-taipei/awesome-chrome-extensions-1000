// Emoji Memory - Popup Script
class EmojiMemory {
  constructor() {
    this.emojis = ['🍎', '🌟', '🎈', '🔥', '💎', '🌈', '🎵', '⚡', '🌸'];
    this.sequence = [];
    this.playerSequence = [];
    this.level = 1;
    this.best = 1;
    this.isPlaying = false;
    this.isShowingSequence = false;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['emojiMemBest']);
    this.best = data.emojiMemBest || 1;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    this.renderGrid();
  }
  renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = this.emojis.map((emoji, i) => `<button class="emoji-btn" data-idx="${i}">${emoji}</button>`).join('');
    grid.addEventListener('click', (e) => this.handleClick(e));
  }
  start() {
    this.sequence = [];
    this.level = 1;
    this.isPlaying = true;
    document.getElementById('level').textContent = 1;
    document.getElementById('feedback').textContent = '';
    document.getElementById('startBtn').style.display = 'none';
    this.nextRound();
  }
  nextRound() {
    this.playerSequence = [];
    this.sequence.push(Math.floor(Math.random() * this.emojis.length));
    this.showSequence();
  }
  async showSequence() {
    this.isShowingSequence = true;
    document.getElementById('display').textContent = 'Watch...';
    await this.sleep(500);
    for (const idx of this.sequence) {
      const btn = document.querySelector(`[data-idx="${idx}"]`);
      btn.classList.add('flash');
      document.getElementById('display').textContent = this.emojis[idx];
      await this.sleep(600);
      btn.classList.remove('flash');
      await this.sleep(200);
    }
    document.getElementById('display').textContent = 'Your turn!';
    this.isShowingSequence = false;
  }
  handleClick(e) {
    if (!this.isPlaying || this.isShowingSequence) return;
    if (!e.target.classList.contains('emoji-btn')) return;
    const idx = parseInt(e.target.dataset.idx);
    this.playerSequence.push(idx);
    document.getElementById('display').textContent = this.emojis[idx];
    const pos = this.playerSequence.length - 1;
    if (this.playerSequence[pos] !== this.sequence[pos]) {
      this.gameOver();
      return;
    }
    if (this.playerSequence.length === this.sequence.length) {
      this.level++;
      document.getElementById('level').textContent = this.level;
      document.getElementById('feedback').textContent = 'Correct!';
      document.getElementById('feedback').className = 'feedback success';
      if (this.level > this.best) {
        this.best = this.level;
        document.getElementById('best').textContent = this.best;
        chrome.storage.local.set({ emojiMemBest: this.best });
      }
      setTimeout(() => {
        document.getElementById('feedback').textContent = '';
        this.nextRound();
      }, 1000);
    }
  }
  gameOver() {
    this.isPlaying = false;
    document.getElementById('feedback').textContent = `Game Over! Reached level ${this.level}`;
    document.getElementById('feedback').className = 'feedback error';
    document.getElementById('startBtn').textContent = 'Play Again';
    document.getElementById('startBtn').style.display = 'block';
  }
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}
document.addEventListener('DOMContentLoaded', () => new EmojiMemory());
