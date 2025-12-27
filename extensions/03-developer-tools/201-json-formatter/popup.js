// JSON Formatter - Popup Script
class JsonFormatter {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.inputEl = document.getElementById('jsonInput'); this.outputEl = document.getElementById('jsonOutput'); this.indentEl = document.getElementById('indent'); this.sortKeysEl = document.getElementById('sortKeys'); this.formatBtn = document.getElementById('formatBtn'); this.minifyBtn = document.getElementById('minifyBtn'); this.copyBtn = document.getElementById('copyBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.formatBtn.addEventListener('click', () => this.format()); this.minifyBtn.addEventListener('click', () => this.minify()); this.copyBtn.addEventListener('click', () => this.copy()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  getIndent() { const v = this.indentEl.value; return v === 'tab' ? '\t' : parseInt(v); }
  sortObject(obj) { if (Array.isArray(obj)) return obj.map(i => this.sortObject(i)); if (obj !== null && typeof obj === 'object') { return Object.keys(obj).sort().reduce((r, k) => { r[k] = this.sortObject(obj[k]); return r; }, {}); } return obj; }
  format() { try { let json = JSON.parse(this.inputEl.value); if (this.sortKeysEl.checked) json = this.sortObject(json); this.outputEl.value = JSON.stringify(json, null, this.getIndent()); this.setStatus('Valid JSON - Formatted!', 'success'); } catch (e) { this.setStatus('Invalid JSON: ' + e.message, 'error'); this.outputEl.value = ''; } }
  minify() { try { const json = JSON.parse(this.inputEl.value); this.outputEl.value = JSON.stringify(json); this.setStatus('JSON minified!', 'success'); } catch (e) { this.setStatus('Invalid JSON: ' + e.message, 'error'); this.outputEl.value = ''; } }
  async copy() { if (!this.outputEl.value) { this.setStatus('Nothing to copy', 'error'); return; } await navigator.clipboard.writeText(this.outputEl.value); this.setStatus('Copied to clipboard!', 'success'); }
}
document.addEventListener('DOMContentLoaded', () => new JsonFormatter());
