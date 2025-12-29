// Tower Stack - Popup Script
class TowerStack {
  constructor() {
    this.blocks = [];
    this.currentWidth = 120;
    this.currentX = 68;
    this.height = 0;
    this.best = 0;
    this.gameRunning = false;
    this.colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    this.init();
  }
  async init() {
    const data = await chrome.storage.local.get(['towerBest']);
    this.best = data.towerBest || 0;
    document.getElementById('best').textContent = this.best;
    document.getElementById('dropBtn').addEventListener('click', () => this.drop());
    document.getElementById('restartBtn').addEventListener('click', () => this.start());
    document.addEventListener('keydown', (e) => { if (e.code === 'Space') this.drop(); });
    this.start();
  }
  start() {
    this.blocks = [];
    this.currentWidth = 120;
    this.currentX = 68;
    this.height = 0;
    this.gameRunning = true;
    document.getElementById('height').textContent = 0;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('game').querySelectorAll('.stacked').forEach(b => b.remove());
    this.updateMoving();
  }
  updateMoving() {
    const moving = document.getElementById('moving');
    moving.style.width = this.currentWidth + 'px';
    moving.style.setProperty('--w', this.currentWidth + 'px');
    moving.style.background = this.colors[this.height % this.colors.length];
  }
  drop() {
    if (!this.gameRunning) return;
    const moving = document.getElementById('moving');
    const rect = moving.getBoundingClientRect();
    const gameRect = document.getElementById('game').getBoundingClientRect();
    const dropX = rect.left - gameRect.left;
    if (this.height === 0) {
      this.addBlock(dropX, this.currentWidth);
    } else {
      const lastBlock = this.blocks[this.blocks.length - 1];
      const overlap = Math.min(dropX + this.currentWidth, lastBlock.x + lastBlock.w) - Math.max(dropX, lastBlock.x);
      if (overlap <= 0) {
        this.gameOver();
        return;
      }
      const newX = Math.max(dropX, lastBlock.x);
      this.addBlock(newX, overlap);
      this.currentWidth = overlap;
      this.currentX = newX;
    }
    this.height++;
    document.getElementById('height').textContent = this.height;
    this.updateMoving();
  }
  addBlock(x, w) {
    const block = document.createElement('div');
    block.className = 'block stacked';
    block.style.width = w + 'px';
    block.style.left = x + 'px';
    block.style.bottom = (this.height * 20) + 'px';
    block.style.background = this.colors[this.height % this.colors.length];
    document.getElementById('game').appendChild(block);
    this.blocks.push({ x, w, el: block });
  }
  gameOver() {
    this.gameRunning = false;
    if (this.height > this.best) {
      this.best = this.height;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ towerBest: this.best });
    }
    document.getElementById('gameOver').style.display = 'block';
  }
}
document.addEventListener('DOMContentLoaded', () => new TowerStack());
