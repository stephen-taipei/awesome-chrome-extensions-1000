// Color Picker - Popup Script
class ColorPicker {
  constructor() { this.history = []; this.initElements(); this.bindEvents(); this.loadHistory(); this.updateColor(); }
  initElements() { this.pickerEl = document.getElementById('colorPicker'); this.previewEl = document.getElementById('preview'); this.hexEl = document.getElementById('hex'); this.rgbEl = document.getElementById('rgb'); this.hslEl = document.getElementById('hsl'); this.statusEl = document.getElementById('status'); this.historyEl = document.getElementById('history'); }
  bindEvents() { this.pickerEl.addEventListener('input', () => this.updateColor()); this.pickerEl.addEventListener('change', () => this.addToHistory()); document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => this.copy(b.dataset.copy))); }
  async loadHistory() { const r = await chrome.storage.local.get('colorHistory'); if (r.colorHistory) this.history = r.colorHistory; this.renderHistory(); }
  async saveHistory() { await chrome.storage.local.set({ colorHistory: this.history }); }
  hexToRgb(hex) { const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16); return { r, g, b }; }
  rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; } } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; }
  updateColor() { const hex = this.pickerEl.value; const rgb = this.hexToRgb(hex); const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b); this.previewEl.style.background = hex; this.hexEl.value = hex.toUpperCase(); this.rgbEl.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`; this.hslEl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`; }
  addToHistory() { const hex = this.pickerEl.value; if (!this.history.includes(hex)) { this.history.unshift(hex); if (this.history.length > 12) this.history.pop(); this.saveHistory(); this.renderHistory(); } }
  renderHistory() { this.historyEl.innerHTML = this.history.map(c => `<div class="history-color" style="background:${c}" data-color="${c}"></div>`).join(''); this.historyEl.querySelectorAll('.history-color').forEach(el => el.addEventListener('click', () => { this.pickerEl.value = el.dataset.color; this.updateColor(); })); }
  async copy(type) { const value = document.getElementById(type).value; await navigator.clipboard.writeText(value); this.statusEl.textContent = `${type.toUpperCase()} copied!`; setTimeout(() => { this.statusEl.textContent = ''; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new ColorPicker());
