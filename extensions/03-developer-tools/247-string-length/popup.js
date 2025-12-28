// String Length Counter - Popup Script
class StringLength {
  constructor() { this.initElements(); this.bindEvents(); this.update(); }
  initElements() { this.input = document.getElementById('input'); this.stats = document.getElementById('stats'); }
  bindEvents() { this.input.addEventListener('input', () => this.update()); }
  update() { const text = this.input.value; const chars = text.length; const charsNoSpace = text.replace(/\s/g, '').length; const words = text.trim() ? text.trim().split(/\s+/).length : 0; const lines = text.split('\n').length; const bytes = new Blob([text]).size; const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length; this.stats.innerHTML = `<div class="stat-row"><span class="stat-label">Characters</span><span class="stat-value">${chars}</span></div><div class="stat-row"><span class="stat-label">Characters (no spaces)</span><span class="stat-value">${charsNoSpace}</span></div><div class="stat-row"><span class="stat-label">Words</span><span class="stat-value">${words}</span></div><div class="stat-row"><span class="stat-label">Lines</span><span class="stat-value">${lines}</span></div><div class="stat-row"><span class="stat-label">Sentences</span><span class="stat-value">${sentences}</span></div><div class="stat-row"><span class="stat-label">Bytes (UTF-8)</span><span class="stat-value">${bytes}</span></div>`; }
}
document.addEventListener('DOMContentLoaded', () => new StringLength());
