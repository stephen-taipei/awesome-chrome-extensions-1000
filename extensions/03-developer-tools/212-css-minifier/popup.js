// CSS Minifier - Popup Script
class CssMinifier {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.inputEl = document.getElementById('input'); this.outputEl = document.getElementById('output'); this.minifyBtn = document.getElementById('minifyBtn'); this.beautifyBtn = document.getElementById('beautifyBtn'); this.copyBtn = document.getElementById('copyBtn'); this.statsEl = document.getElementById('stats'); }
  bindEvents() { this.minifyBtn.addEventListener('click', () => this.minify()); this.beautifyBtn.addEventListener('click', () => this.beautify()); this.copyBtn.addEventListener('click', () => this.copy()); }
  minify() { const css = this.inputEl.value; if (!css.trim()) { this.statsEl.textContent = 'Please enter CSS'; return; } const original = css.length; let min = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,>+~])\s*/g, '$1').replace(/;}/g, '}').trim(); this.outputEl.value = min; const saved = ((1 - min.length / original) * 100).toFixed(1); this.statsEl.textContent = `Original: ${original} bytes → Minified: ${min.length} bytes (${saved}% saved)`; }
  beautify() { const css = this.inputEl.value; if (!css.trim()) { this.statsEl.textContent = 'Please enter CSS'; return; } let result = css.replace(/\s*{\s*/g, ' {\n  ').replace(/\s*}\s*/g, '\n}\n\n').replace(/;\s*/g, ';\n  ').replace(/,\s*/g, ',\n').replace(/\n  }/g, '\n}').replace(/\n\n+/g, '\n\n').trim(); this.outputEl.value = result; this.statsEl.textContent = 'CSS beautified!'; }
  async copy() { if (!this.outputEl.value) { this.statsEl.textContent = 'Nothing to copy'; return; } await navigator.clipboard.writeText(this.outputEl.value); this.statsEl.textContent = 'Copied to clipboard!'; }
}
document.addEventListener('DOMContentLoaded', () => new CssMinifier());
