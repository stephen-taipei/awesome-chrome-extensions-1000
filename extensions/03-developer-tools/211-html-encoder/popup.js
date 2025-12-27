// HTML Encoder - Popup Script
class HtmlEncoder {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.inputEl = document.getElementById('input'); this.outputEl = document.getElementById('output'); this.encodeBtn = document.getElementById('encodeBtn'); this.decodeBtn = document.getElementById('decodeBtn'); this.copyBtn = document.getElementById('copyBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.encodeBtn.addEventListener('click', () => this.encode()); this.decodeBtn.addEventListener('click', () => this.decode()); this.copyBtn.addEventListener('click', () => this.copy()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  encode() { const text = this.inputEl.value; if (!text) { this.setStatus('Please enter text to encode', 'error'); return; } const div = document.createElement('div'); div.textContent = text; this.outputEl.value = div.innerHTML; this.setStatus('HTML encoded!', 'success'); }
  decode() { const text = this.inputEl.value; if (!text) { this.setStatus('Please enter HTML to decode', 'error'); return; } const div = document.createElement('div'); div.innerHTML = text; this.outputEl.value = div.textContent; this.setStatus('HTML decoded!', 'success'); }
  async copy() { if (!this.outputEl.value) { this.setStatus('Nothing to copy', 'error'); return; } await navigator.clipboard.writeText(this.outputEl.value); this.setStatus('Copied to clipboard!', 'success'); }
}
document.addEventListener('DOMContentLoaded', () => new HtmlEncoder());
