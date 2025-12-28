// Hex Editor - Popup Script
class HexEditor {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.textInput = document.getElementById('textInput'); this.hexInput = document.getElementById('hexInput'); this.toHexBtn = document.getElementById('toHexBtn'); this.toTextBtn = document.getElementById('toTextBtn'); this.copyBtn = document.getElementById('copyBtn'); }
  bindEvents() { this.toHexBtn.addEventListener('click', () => this.toHex()); this.toTextBtn.addEventListener('click', () => this.toText()); this.copyBtn.addEventListener('click', () => this.copy()); }
  toHex() { const text = this.textInput.value; const hex = Array.from(text).map(c => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()).join(' '); this.hexInput.value = hex; }
  toText() { const hex = this.hexInput.value.trim(); const bytes = hex.split(/\s+/).filter(b => b); try { const text = bytes.map(b => String.fromCharCode(parseInt(b, 16))).join(''); this.textInput.value = text; } catch (e) { this.textInput.value = 'Invalid hex'; } }
  async copy() { if (!this.hexInput.value) return; await navigator.clipboard.writeText(this.hexInput.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy Hex'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new HexEditor());
