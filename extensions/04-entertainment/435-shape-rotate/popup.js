// Shape Rotate - Popup Script
class ShapeRotate {
  constructor() {
    this.shapes = [
      '<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="#14b8a6"/><circle cx="50" cy="60" r="10" fill="#1e293b"/></svg>',
      '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#f59e0b"/><rect x="30" y="30" width="20" height="20" fill="#1e293b"/></svg>',
      '<svg viewBox="0 0 100 100"><polygon points="50,5 95,35 80,90 20,90 5,35" fill="#ec4899"/><circle cx="50" cy="50" r="15" fill="#1e293b"/></svg>',
      '<svg viewBox="0 0 100 100"><polygon points="50,10 90,40 75,90 25,90 10,40" fill="#6366f1"/><rect x="40" y="50" width="20" height="30" fill="#1e293b"/></svg>'
    ];
    this.targetRotation = 0;
    this.playerRotation = 0;
    this.currentShape = 0;
    this.score = 0;
    this.level = 1;
    this.init();
  }
  init() {
    chrome.storage.local.get(['shapeRotScore', 'shapeRotLevel'], (r) => {
      this.score = r.shapeRotScore || 0;
      this.level = r.shapeRotLevel || 1;
      this.updateStats();
    });
    document.getElementById('player').addEventListener('click', () => this.rotate());
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
    this.newPuzzle();
  }
  newPuzzle() {
    this.currentShape = Math.floor(Math.random() * this.shapes.length);
    this.targetRotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    this.playerRotation = 0;
    while (this.playerRotation === this.targetRotation) {
      this.playerRotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    }
    this.render();
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
  }
  render() {
    document.getElementById('target').innerHTML = this.shapes[this.currentShape];
    document.getElementById('target').style.transform = `rotate(${this.targetRotation}deg)`;
    document.getElementById('player').innerHTML = this.shapes[this.currentShape];
    document.getElementById('player').style.transform = `rotate(${this.playerRotation}deg)`;
  }
  rotate() {
    this.playerRotation = (this.playerRotation + 90) % 360;
    this.render();
  }
  check() {
    if (this.playerRotation === this.targetRotation) {
      this.score += 10 * this.level;
      this.level = Math.min(this.level + 1, 10);
      chrome.storage.local.set({ shapeRotScore: this.score, shapeRotLevel: this.level });
      document.getElementById('feedback').textContent = 'Perfect match!';
      document.getElementById('feedback').className = 'feedback correct';
      this.updateStats();
      setTimeout(() => this.newPuzzle(), 800);
    } else {
      document.getElementById('feedback').textContent = 'Not quite, try again!';
      document.getElementById('feedback').className = 'feedback wrong';
    }
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new ShapeRotate());
