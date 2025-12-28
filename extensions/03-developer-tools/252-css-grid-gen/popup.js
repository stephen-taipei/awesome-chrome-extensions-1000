// CSS Grid Generator - Popup Script
class CssGridGenerator {
  constructor() { this.initElements(); this.bindEvents(); this.update(); }
  initElements() { this.cols = document.getElementById('cols'); this.rows = document.getElementById('rows'); this.gap = document.getElementById('gap'); this.preview = document.getElementById('preview'); this.cssOutput = document.getElementById('cssOutput'); this.copyBtn = document.getElementById('copyBtn'); }
  bindEvents() { [this.cols, this.rows, this.gap].forEach(el => el.addEventListener('input', () => this.update())); this.copyBtn.addEventListener('click', () => this.copy()); }
  update() { const c = Math.min(parseInt(this.cols.value) || 3, 12); const r = Math.min(parseInt(this.rows.value) || 2, 12); const g = parseInt(this.gap.value) || 0; this.preview.style.gridTemplateColumns = `repeat(${c}, 1fr)`; this.preview.style.gridTemplateRows = `repeat(${r}, 1fr)`; this.preview.style.gap = `${g}px`; this.preview.innerHTML = Array(c * r).fill('<div class="preview-cell"></div>').join(''); this.cssOutput.value = `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(${c}, 1fr);\n  grid-template-rows: repeat(${r}, 1fr);\n  gap: ${g}px;\n}`; }
  async copy() { await navigator.clipboard.writeText(this.cssOutput.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy CSS'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new CssGridGenerator());
