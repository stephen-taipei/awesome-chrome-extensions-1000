// Epoch Converter - Popup Script
class EpochConverter {
  constructor() { this.initElements(); this.bindEvents(); this.startClock(); this.setCurrentDate(); }
  initElements() { this.currentEpoch = document.getElementById('currentEpoch'); this.epochInput = document.getElementById('epochInput'); this.dateInput = document.getElementById('dateInput'); this.dateResult = document.getElementById('dateResult'); this.epochResult = document.getElementById('epochResult'); this.formats = document.getElementById('formats'); this.toDateBtn = document.getElementById('toDateBtn'); this.toEpochBtn = document.getElementById('toEpochBtn'); this.copyBtn = document.getElementById('copyBtn'); }
  bindEvents() { this.toDateBtn.addEventListener('click', () => this.toDate()); this.toEpochBtn.addEventListener('click', () => this.toEpoch()); this.copyBtn.addEventListener('click', () => this.copy()); this.epochInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.toDate(); }); }
  startClock() { this.updateClock(); setInterval(() => this.updateClock(), 1000); }
  updateClock() { this.currentEpoch.textContent = Math.floor(Date.now() / 1000); }
  setCurrentDate() { const now = new Date(); const offset = now.getTimezoneOffset() * 60000; const local = new Date(now - offset); this.dateInput.value = local.toISOString().slice(0, 16); }
  toDate() { const epoch = parseInt(this.epochInput.value.trim()); if (isNaN(epoch)) { this.dateResult.textContent = 'Invalid timestamp'; return; } const ms = epoch.toString().length > 10 ? epoch : epoch * 1000; const date = new Date(ms); this.dateResult.textContent = date.toString(); this.showFormats(date); }
  toEpoch() { const date = new Date(this.dateInput.value); if (isNaN(date.getTime())) { this.epochResult.textContent = 'Invalid date'; return; } const epoch = Math.floor(date.getTime() / 1000); this.epochResult.textContent = `Seconds: ${epoch}\nMilliseconds: ${date.getTime()}`; this.showFormats(date); }
  showFormats(date) { this.formats.innerHTML = `<div class="format-row"><span class="label">ISO 8601:</span><span class="value">${date.toISOString()}</span></div><div class="format-row"><span class="label">UTC:</span><span class="value">${date.toUTCString()}</span></div><div class="format-row"><span class="label">Local:</span><span class="value">${date.toLocaleString()}</span></div>`; }
  async copy() { await navigator.clipboard.writeText(this.currentEpoch.textContent); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy Current Epoch'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new EpochConverter());
