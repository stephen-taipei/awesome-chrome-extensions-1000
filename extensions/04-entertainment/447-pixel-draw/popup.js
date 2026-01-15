// Pixel Draw - Popup Script
class PixelDraw {
  constructor() {
    this.colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#000000', '#6b7280', '#92400e'];
    this.selectedColor = this.colors[0];
    this.isErasing = false;
    this.isDrawing = false;
    this.grid = Array(256).fill('#374151');
    this.init();
  }
  init() {
    chrome.storage.local.get(['pixelDrawGrid'], (r) => {
      if (r.pixelDrawGrid) this.grid = r.pixelDrawGrid;
      this.renderCanvas();
    });
    this.renderPalette();
    document.getElementById('eraseBtn').addEventListener('click', () => {
      this.isErasing = !this.isErasing;
      document.getElementById('eraseBtn').style.background = this.isErasing ? '#ef4444' : '#374151';
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
      this.grid = Array(256).fill('#374151');
      this.save();
      this.renderCanvas();
    });
  }
  renderPalette() {
    const el = document.getElementById('palette');
    el.innerHTML = this.colors.map((c, i) =>
      `<div class="color ${i === 0 ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>`
    ).join('');
    el.querySelectorAll('.color').forEach(col => {
      col.addEventListener('click', () => {
        el.querySelectorAll('.color').forEach(c => c.classList.remove('selected'));
        col.classList.add('selected');
        this.selectedColor = col.dataset.color;
        this.isErasing = false;
        document.getElementById('eraseBtn').style.background = '#374151';
      });
    });
  }
  renderCanvas() {
    const el = document.getElementById('canvas');
    el.innerHTML = this.grid.map((c, i) => `<div class="pixel" data-i="${i}" style="background:${c}"></div>`).join('');
    el.querySelectorAll('.pixel').forEach(px => {
      px.addEventListener('mousedown', (e) => { this.isDrawing = true; this.paint(e.target); });
      px.addEventListener('mouseenter', (e) => { if (this.isDrawing) this.paint(e.target); });
      px.addEventListener('mouseup', () => { this.isDrawing = false; this.save(); });
    });
    el.addEventListener('mouseleave', () => { if (this.isDrawing) { this.isDrawing = false; this.save(); } });
  }
  paint(pixel) {
    const i = parseInt(pixel.dataset.i);
    this.grid[i] = this.isErasing ? '#374151' : this.selectedColor;
    pixel.style.background = this.grid[i];
  }
  save() {
    chrome.storage.local.set({ pixelDrawGrid: this.grid });
  }
}
document.addEventListener('DOMContentLoaded', () => new PixelDraw());
