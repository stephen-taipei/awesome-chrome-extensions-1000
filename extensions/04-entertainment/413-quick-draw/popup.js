// Quick Draw - Popup Script
class QuickDraw {
  constructor() {
    this.shapes = ['Circle', 'Square', 'Triangle', 'Star', 'Heart', 'Line', 'Spiral', 'Arrow'];
    this.canvas = null;
    this.ctx = null;
    this.drawing = false;
    this.current = '';
    this.score = 0;
    this.best = 0;
    this.strokes = 0;
    this.init();
  }
  init() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    chrome.storage.local.get(['quickDrawBest'], (r) => {
      if (r.quickDrawBest) this.best = r.quickDrawBest;
      this.updateStats();
    });
    this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDraw());
    this.canvas.addEventListener('mouseleave', () => this.stopDraw());
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    document.getElementById('doneBtn').addEventListener('click', () => this.submit());
    this.newRound();
  }
  newRound() {
    this.current = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    document.getElementById('shape').textContent = this.current;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    this.clear();
  }
  startDraw(e) {
    this.drawing = true;
    this.strokes++;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.beginPath();
    this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }
  draw(e) {
    if (!this.drawing) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    this.ctx.strokeStyle = '#84cc16';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
  }
  stopDraw() {
    this.drawing = false;
  }
  clear() {
    this.ctx.clearRect(0, 0, 240, 160);
    this.strokes = 0;
  }
  submit() {
    const data = this.ctx.getImageData(0, 0, 240, 160).data;
    let pixels = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) pixels++;
    if (pixels < 100) {
      document.getElementById('message').textContent = 'Draw something!';
      document.getElementById('message').className = 'message error';
      return;
    }
    const success = Math.random() > 0.3;
    if (success) {
      const pts = 10 + Math.floor(Math.random() * 20);
      this.score += pts;
      if (this.score > this.best) {
        this.best = this.score;
        chrome.storage.local.set({ quickDrawBest: this.best });
      }
      document.getElementById('message').textContent = `Nice ${this.current}! +${pts}`;
      document.getElementById('message').className = 'message success';
    } else {
      document.getElementById('message').textContent = 'Try again!';
      document.getElementById('message').className = 'message error';
    }
    this.updateStats();
    setTimeout(() => this.newRound(), 1200);
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('best').textContent = this.best;
  }
}
document.addEventListener('DOMContentLoaded', () => new QuickDraw());
