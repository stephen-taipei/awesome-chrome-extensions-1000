// Flexbox Generator - Popup Script
class FlexboxGenerator {
  constructor() { this.initElements(); this.bindEvents(); this.update(); }
  initElements() { this.direction = document.getElementById('direction'); this.justify = document.getElementById('justify'); this.align = document.getElementById('align'); this.wrap = document.getElementById('wrap'); this.gap = document.getElementById('gap'); this.preview = document.getElementById('preview'); this.cssOutput = document.getElementById('cssOutput'); this.copyBtn = document.getElementById('copyBtn'); }
  bindEvents() { [this.direction, this.justify, this.align, this.wrap, this.gap].forEach(el => el.addEventListener('input', () => this.update())); this.copyBtn.addEventListener('click', () => this.copy()); }
  update() { const d = this.direction.value; const j = this.justify.value; const a = this.align.value; const w = this.wrap.value; const g = parseInt(this.gap.value) || 0; this.preview.style.flexDirection = d; this.preview.style.justifyContent = j; this.preview.style.alignItems = a; this.preview.style.flexWrap = w; this.preview.style.gap = `${g}px`; this.preview.innerHTML = '<div class="preview-item"></div><div class="preview-item"></div><div class="preview-item"></div>'; this.cssOutput.value = `.flex-container {\n  display: flex;\n  flex-direction: ${d};\n  justify-content: ${j};\n  align-items: ${a};\n  flex-wrap: ${w};\n  gap: ${g}px;\n}`; }
  async copy() { await navigator.clipboard.writeText(this.cssOutput.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy CSS'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new FlexboxGenerator());
