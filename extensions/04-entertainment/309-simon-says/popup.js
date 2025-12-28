// Simon Says - Popup Script
class SimonSays {
  constructor() {
    this.sequence = [];
    this.playerIndex = 0;
    this.score = 0;
    this.bestScore = 0;
    this.playing = false;
    this.init();
  }
  init() {
    document.querySelectorAll('.pad').forEach(pad => {
      pad.addEventListener('click', () => this.playerInput(parseInt(pad.dataset.color)));
    });
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    this.loadBest();
  }
  startGame() {
    this.sequence = [];
    this.score = 0;
    this.playing = true;
    this.updateScore();
    this.nextRound();
  }
  nextRound() {
    this.playerIndex = 0;
    this.sequence.push(Math.floor(Math.random() * 4));
    this.playSequence();
  }
  async playSequence() {
    this.setStatus('Watch carefully...', 'watching');
    this.setPadsEnabled(false);
    document.getElementById('startBtn').disabled = true;
    await this.delay(500);
    for (const color of this.sequence) {
      await this.flashPad(color);
      await this.delay(200);
    }
    this.setStatus('Your turn!', 'your-turn');
    this.setPadsEnabled(true);
  }
  async flashPad(color) {
    const pad = document.querySelector(`[data-color="${color}"]`);
    pad.classList.add('active');
    await this.delay(400);
    pad.classList.remove('active');
  }
  playerInput(color) {
    if (!this.playing) return;
    this.flashPad(color);
    if (color === this.sequence[this.playerIndex]) {
      this.playerIndex++;
      if (this.playerIndex === this.sequence.length) {
        this.score++;
        this.updateScore();
        setTimeout(() => this.nextRound(), 1000);
      }
    } else {
      this.gameOver();
    }
  }
  gameOver() {
    this.playing = false;
    this.setStatus(`Game Over! Score: ${this.score}`, 'game-over');
    this.setPadsEnabled(false);
    document.getElementById('startBtn').disabled = false;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBest();
    }
    this.updateScore();
  }
  setStatus(text, className) {
    const status = document.getElementById('status');
    status.textContent = text;
    status.className = 'status ' + (className || '');
  }
  setPadsEnabled(enabled) {
    document.querySelectorAll('.pad').forEach(p => p.disabled = !enabled);
  }
  updateScore() {
    document.getElementById('score').textContent = `Score: ${this.score} | Best: ${this.bestScore}`;
  }
  delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  saveBest() { chrome.storage.local.set({ simonBest: this.bestScore }); }
  loadBest() {
    chrome.storage.local.get(['simonBest'], (r) => {
      this.bestScore = r.simonBest || 0;
      this.updateScore();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new SimonSays());
