// Balance Scale - Popup Script
class BalanceScale {
  constructor() {
    this.targetWeight = 0;
    this.currentWeight = 0;
    this.selected = [];
    this.available = [];
    this.score = 0;
    this.level = 1;
    this.init();
  }
  init() {
    chrome.storage.local.get(['balanceScaleScore', 'balanceScaleLevel'], (r) => {
      this.score = r.balanceScaleScore || 0;
      this.level = r.balanceScaleLevel || 1;
      this.updateStats();
    });
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
    this.newPuzzle();
  }
  newPuzzle() {
    this.selected = [];
    this.currentWeight = 0;
    const maxWeight = 10 + this.level * 5;
    this.targetWeight = Math.floor(Math.random() * maxWeight) + 5;
    this.available = [];
    const count = 5 + Math.min(this.level, 5);
    while (this.available.length < count) {
      const w = Math.floor(Math.random() * 10) + 1;
      this.available.push(w);
    }
    if (!this.canMakeTarget()) {
      const needed = this.targetWeight - this.available.reduce((a, b) => a + b, 0);
      if (needed > 0) this.available.push(needed);
    }
    this.available.sort(() => Math.random() - 0.5);
    document.getElementById('leftWeight').textContent = this.targetWeight;
    this.updateBeam();
    this.renderWeights();
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  canMakeTarget() {
    const sum = this.available.reduce((a, b) => a + b, 0);
    return sum >= this.targetWeight;
  }
  renderWeights() {
    const el = document.getElementById('weights');
    el.innerHTML = this.available.map((w, i) =>
      `<div class="weight ${this.selected.includes(i) ? 'selected' : ''}" data-i="${i}">${w}</div>`
    ).join('');
    el.querySelectorAll('.weight').forEach(we => {
      we.addEventListener('click', () => this.toggleWeight(parseInt(we.dataset.i)));
    });
  }
  toggleWeight(index) {
    if (this.selected.includes(index)) {
      this.selected = this.selected.filter(i => i !== index);
    } else {
      this.selected.push(index);
    }
    this.currentWeight = this.selected.reduce((sum, i) => sum + this.available[i], 0);
    document.getElementById('rightWeight').textContent = this.currentWeight;
    this.updateBeam();
    this.renderWeights();
  }
  updateBeam() {
    const beam = document.getElementById('beam');
    beam.classList.remove('left', 'right');
    if (this.currentWeight < this.targetWeight) beam.classList.add('left');
    else if (this.currentWeight > this.targetWeight) beam.classList.add('right');
  }
  check() {
    const fb = document.getElementById('feedback');
    if (this.currentWeight === this.targetWeight) {
      this.score += 10 * this.level;
      this.level = Math.min(this.level + 1, 10);
      chrome.storage.local.set({ balanceScaleScore: this.score, balanceScaleLevel: this.level });
      this.updateStats();
      fb.textContent = '✓ Perfectly balanced!';
      fb.className = 'feedback correct';
      setTimeout(() => this.newPuzzle(), 1000);
    } else {
      fb.textContent = this.currentWeight < this.targetWeight ? '✗ Too light!' : '✗ Too heavy!';
      fb.className = 'feedback wrong';
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new BalanceScale());
