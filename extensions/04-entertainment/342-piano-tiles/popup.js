// Piano Tiles - Popup Script
class PianoTiles {
  constructor() {
    this.score = 0;
    this.best = 0;
    this.rows = 7;
    this.cols = 4;
    this.tiles = [];
    this.gameRunning = false;
    this.interval = null;
    this.audioCtx = null;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['pianoBest']);
    this.best = data.pianoBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('restartBtn').addEventListener('click', () => this.start());
    document.getElementById('game').addEventListener('click', (e) => this.handleClick(e));
    this.render();
  }
  start() {
    this.score = 0;
    this.tiles = [];
    this.gameRunning = true;
    document.getElementById('score').textContent = 0;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startBtn').style.display = 'none';
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < this.rows; i++) {
      this.tiles.push(this.createRow());
    }
    this.render();
    this.interval = setInterval(() => this.tick(), 600);
  }
  createRow() {
    const blackIdx = Math.floor(Math.random() * this.cols);
    return Array(this.cols).fill(false).map((_, i) => i === blackIdx);
  }
  tick() {
    const lastRow = this.tiles[this.tiles.length - 1];
    if (lastRow.some(t => t)) {
      this.gameOver();
      return;
    }
    this.tiles.pop();
    this.tiles.unshift(this.createRow());
    this.render();
  }
  handleClick(e) {
    if (!this.gameRunning) return;
    const tile = e.target;
    if (!tile.classList.contains('tile')) return;
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);
    if (this.tiles[row][col]) {
      this.tiles[row][col] = false;
      this.score++;
      document.getElementById('score').textContent = this.score;
      this.playNote(col);
      tile.classList.add('hit');
      setTimeout(() => tile.classList.remove('hit'), 100);
    } else {
      tile.classList.add('miss');
      this.gameOver();
    }
  }
  playNote(col) {
    const freqs = [262, 294, 330, 349];
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.frequency.value = freqs[col];
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }
  gameOver() {
    this.gameRunning = false;
    clearInterval(this.interval);
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ pianoBest: this.best });
    }
    document.getElementById('gameOver').style.display = 'block';
  }
  render() {
    const game = document.getElementById('game');
    game.innerHTML = '';
    this.tiles.forEach((row, r) => {
      row.forEach((isBlack, c) => {
        const tile = document.createElement('div');
        tile.className = 'tile' + (isBlack ? ' black' : '');
        tile.dataset.row = r;
        tile.dataset.col = c;
        game.appendChild(tile);
      });
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new PianoTiles());
