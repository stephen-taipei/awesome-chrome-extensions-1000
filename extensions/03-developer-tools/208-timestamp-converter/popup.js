// Timestamp Converter - Popup Script
class TimestampConverter {
  constructor() { this.initElements(); this.bindEvents(); this.startClock(); this.setDefaultDate(); }
  initElements() { this.currentTsEl = document.getElementById('currentTs'); this.unixInputEl = document.getElementById('unixInput'); this.dateOutputEl = document.getElementById('dateOutput'); this.dateInputEl = document.getElementById('dateInput'); this.unixOutputEl = document.getElementById('unixOutput'); this.toDateBtn = document.getElementById('toDateBtn'); this.toUnixBtn = document.getElementById('toUnixBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.toDateBtn.addEventListener('click', () => this.toDate()); this.toUnixBtn.addEventListener('click', () => this.toUnix()); this.currentTsEl.addEventListener('click', () => this.copyCurrentTs()); }
  startClock() { const update = () => { this.currentTsEl.textContent = Math.floor(Date.now() / 1000); }; update(); setInterval(update, 1000); }
  setDefaultDate() { const now = new Date(); const offset = now.getTimezoneOffset() * 60000; const local = new Date(now - offset); this.dateInputEl.value = local.toISOString().slice(0, 16); }
  toDate() { const ts = parseInt(this.unixInputEl.value); if (isNaN(ts)) { this.statusEl.textContent = 'Invalid timestamp'; return; } const ms = ts > 9999999999 ? ts : ts * 1000; const date = new Date(ms); this.dateOutputEl.value = date.toLocaleString() + ' (' + date.toISOString() + ')'; this.statusEl.textContent = 'Converted!'; }
  toUnix() { const date = new Date(this.dateInputEl.value); if (isNaN(date.getTime())) { this.statusEl.textContent = 'Invalid date'; return; } this.unixOutputEl.value = Math.floor(date.getTime() / 1000); this.statusEl.textContent = 'Converted!'; }
  async copyCurrentTs() { await navigator.clipboard.writeText(this.currentTsEl.textContent); this.statusEl.textContent = 'Timestamp copied!'; }
}
document.addEventListener('DOMContentLoaded', () => new TimestampConverter());
