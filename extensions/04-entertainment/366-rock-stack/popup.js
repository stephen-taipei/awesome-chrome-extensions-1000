// Rock Stack - Popup Script
class RockStack {
  constructor() {
    this.rocks = [];
    this.height = 0;
    this.best = 0;
    this.baseY = 200;
    this.gameOver = false;
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['rockBest']);
    this.best = data.rockBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('dropBtn').addEventListener('click', () => this.drop());
    document.addEventListener('keydown', (e) => { if (e.code === 'Space') this.drop(); });
  }
  drop() {
    if (this.gameOver) {
      this.reset();
      return;
    }
    const moving = document.getElementById('moving');
    const rect = moving.getBoundingClientRect();
    const gameRect = document.getElementById('game').getBoundingClientRect();
    const dropX = rect.left - gameRect.left;
    const targetY = this.baseY - (this.rocks.length * 24);
    if (this.rocks.length > 0) {
      const lastRock = this.rocks[this.rocks.length - 1];
      const diff = Math.abs(dropX - lastRock.x);
      if (diff > 40) {
        this.endGame();
        return;
      }
    }
    const rock = document.createElement('div');
    rock.className = 'rock falling';
    rock.textContent = '🪨';
    rock.style.left = dropX + 'px';
    rock.style.top = targetY + 'px';
    document.getElementById('game').appendChild(rock);
    this.rocks.push({ x: dropX, el: rock });
    this.height = this.rocks.length;
    document.getElementById('height').textContent = this.height;
    if (this.height > this.best) {
      this.best = this.height;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ rockBest: this.best });
    }
    if (targetY <= 40) {
      this.endGame(true);
    }
  }
  endGame(win = false) {
    this.gameOver = true;
    document.getElementById('dropBtn').textContent = win ? '🎉 You Won! Play Again' : 'Game Over - Play Again';
  }
  reset() {
    this.rocks.forEach(r => r.el.remove());
    this.rocks = [];
    this.height = 0;
    this.gameOver = false;
    document.getElementById('height').textContent = 0;
    document.getElementById('dropBtn').textContent = 'Drop Rock';
  }
}
document.addEventListener('DOMContentLoaded', () => new RockStack());
