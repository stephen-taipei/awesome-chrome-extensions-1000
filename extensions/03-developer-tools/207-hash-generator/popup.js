// Hash Generator - Popup Script
class HashGenerator {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.inputEl = document.getElementById('input'); this.hashBtn = document.getElementById('hashBtn'); this.statusEl = document.getElementById('status'); this.outputs = { sha256: document.getElementById('sha256'), sha1: document.getElementById('sha1'), sha384: document.getElementById('sha384'), sha512: document.getElementById('sha512') }; }
  bindEvents() { this.hashBtn.addEventListener('click', () => this.generateAll()); document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => this.copy(b.dataset.copy))); }
  async hash(algorithm, text) { const encoder = new TextEncoder(); const data = encoder.encode(text); const hashBuffer = await crypto.subtle.digest(algorithm, data); const hashArray = Array.from(new Uint8Array(hashBuffer)); return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); }
  async generateAll() { const text = this.inputEl.value; if (!text) { this.statusEl.textContent = 'Please enter text to hash'; return; } try { this.outputs.sha256.value = await this.hash('SHA-256', text); this.outputs.sha1.value = await this.hash('SHA-1', text); this.outputs.sha384.value = await this.hash('SHA-384', text); this.outputs.sha512.value = await this.hash('SHA-512', text); this.statusEl.textContent = 'Hashes generated!'; } catch (e) { this.statusEl.textContent = 'Error: ' + e.message; } }
  async copy(type) { const value = this.outputs[type].value; if (!value) return; await navigator.clipboard.writeText(value); this.statusEl.textContent = `${type.toUpperCase()} copied!`; }
}
document.addEventListener('DOMContentLoaded', () => new HashGenerator());
