// UUID Generator - Popup Script
class UuidGenerator {
  constructor() { this.uuids = []; this.initElements(); this.bindEvents(); this.generate(); }
  initElements() { this.formatEl = document.getElementById('format'); this.countEl = document.getElementById('count'); this.generateBtn = document.getElementById('generateBtn'); this.copyAllBtn = document.getElementById('copyAllBtn'); this.listEl = document.getElementById('uuidList'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.generateBtn.addEventListener('click', () => this.generate()); this.copyAllBtn.addEventListener('click', () => this.copyAll()); }
  generateUuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); }
  formatUuid(uuid) { const format = this.formatEl.value; if (format === 'upper') return uuid.toUpperCase(); if (format === 'noDash') return uuid.replace(/-/g, ''); return uuid; }
  generate() { const count = Math.min(Math.max(parseInt(this.countEl.value) || 1, 1), 100); this.uuids = []; for (let i = 0; i < count; i++) this.uuids.push(this.formatUuid(this.generateUuid())); this.render(); this.statusEl.textContent = `${count} UUID(s) generated`; }
  render() { this.listEl.innerHTML = this.uuids.map((u, i) => `<div class="uuid-item"><span>${u}</span><button data-idx="${i}">Copy</button></div>`).join(''); this.listEl.querySelectorAll('button').forEach(b => b.addEventListener('click', () => this.copy(parseInt(b.dataset.idx)))); }
  async copy(idx) { await navigator.clipboard.writeText(this.uuids[idx]); this.statusEl.textContent = 'UUID copied!'; }
  async copyAll() { await navigator.clipboard.writeText(this.uuids.join('\n')); this.statusEl.textContent = 'All UUIDs copied!'; }
}
document.addEventListener('DOMContentLoaded', () => new UuidGenerator());
