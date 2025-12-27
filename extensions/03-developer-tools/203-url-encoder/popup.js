// URL Encoder - Popup Script
class UrlEncoder {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.inputEl = document.getElementById('input'); this.outputEl = document.getElementById('output'); this.componentEl = document.getElementById('encodeComponent'); this.encodeBtn = document.getElementById('encodeBtn'); this.decodeBtn = document.getElementById('decodeBtn'); this.copyBtn = document.getElementById('copyBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.encodeBtn.addEventListener('click', () => this.encode()); this.decodeBtn.addEventListener('click', () => this.decode()); this.copyBtn.addEventListener('click', () => this.copy()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  encode() { try { const text = this.inputEl.value; if (!text) { this.setStatus('Please enter text to encode', 'error'); return; } this.outputEl.value = this.componentEl.checked ? encodeURIComponent(text) : encodeURI(text); this.setStatus('URL encoded!', 'success'); } catch (e) { this.setStatus('Encoding error: ' + e.message, 'error'); } }
  decode() { try { const text = this.inputEl.value; if (!text) { this.setStatus('Please enter URL to decode', 'error'); return; } this.outputEl.value = this.componentEl.checked ? decodeURIComponent(text) : decodeURI(text); this.setStatus('URL decoded!', 'success'); } catch (e) { this.setStatus('Invalid encoded URL', 'error'); } }
  async copy() { if (!this.outputEl.value) { this.setStatus('Nothing to copy', 'error'); return; } await navigator.clipboard.writeText(this.outputEl.value); this.setStatus('Copied to clipboard!', 'success'); }
}
document.addEventListener('DOMContentLoaded', () => new UrlEncoder());
