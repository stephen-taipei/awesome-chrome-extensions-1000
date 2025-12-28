// Rock Paper Scissors - Popup Script
class RPS {
  constructor() {
    this.choices = ['rock', 'paper', 'scissors'];
    this.emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    this.playerScore = 0;
    this.cpuScore = 0;
    this.init();
  }
  init() {
    document.querySelectorAll('.choice').forEach(btn => {
      btn.addEventListener('click', () => this.play(btn.dataset.choice));
    });
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    this.loadScore();
  }
  play(playerChoice) {
    const cpuChoice = this.choices[Math.floor(Math.random() * 3)];
    const result = this.getResult(playerChoice, cpuChoice);
    const resultEl = document.getElementById('result');
    resultEl.className = 'result';
    if (result === 'win') {
      this.playerScore++;
      resultEl.classList.add('win');
      resultEl.textContent = `${this.emojis[playerChoice]} beats ${this.emojis[cpuChoice]} - You win!`;
    } else if (result === 'lose') {
      this.cpuScore++;
      resultEl.classList.add('lose');
      resultEl.textContent = `${this.emojis[cpuChoice]} beats ${this.emojis[playerChoice]} - CPU wins!`;
    } else {
      resultEl.classList.add('draw');
      resultEl.textContent = `${this.emojis[playerChoice]} vs ${this.emojis[cpuChoice]} - Draw!`;
    }
    this.updateScore();
    this.saveScore();
  }
  getResult(player, cpu) {
    if (player === cpu) return 'draw';
    if ((player === 'rock' && cpu === 'scissors') || (player === 'paper' && cpu === 'rock') || (player === 'scissors' && cpu === 'paper')) return 'win';
    return 'lose';
  }
  updateScore() {
    document.getElementById('playerScore').textContent = this.playerScore;
    document.getElementById('cpuScore').textContent = this.cpuScore;
  }
  reset() {
    this.playerScore = 0;
    this.cpuScore = 0;
    this.updateScore();
    this.saveScore();
    document.getElementById('result').className = 'result';
    document.getElementById('result').textContent = 'Choose your move!';
  }
  saveScore() { chrome.storage.local.set({ rpsScore: { player: this.playerScore, cpu: this.cpuScore } }); }
  loadScore() {
    chrome.storage.local.get(['rpsScore'], (r) => {
      if (r.rpsScore) {
        this.playerScore = r.rpsScore.player || 0;
        this.cpuScore = r.rpsScore.cpu || 0;
        this.updateScore();
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new RPS());
