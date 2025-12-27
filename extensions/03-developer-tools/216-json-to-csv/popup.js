// JSON to CSV - Popup Script
class JsonToCsv {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.jsonEl = document.getElementById('jsonInput'); this.csvEl = document.getElementById('csvOutput'); this.headerEl = document.getElementById('includeHeader'); this.convertBtn = document.getElementById('convertBtn'); this.copyBtn = document.getElementById('copyBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.convertBtn.addEventListener('click', () => this.convert()); this.copyBtn.addEventListener('click', () => this.copy()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  escapeCSV(val) { if (val === null || val === undefined) return ''; const str = String(val); if (str.includes(',') || str.includes('"') || str.includes('\n')) { return '"' + str.replace(/"/g, '""') + '"'; } return str; }
  convert() { const json = this.jsonEl.value; if (!json.trim()) { this.setStatus('Please enter JSON data', 'error'); return; } try { const data = JSON.parse(json); if (!Array.isArray(data)) { this.setStatus('JSON must be an array of objects', 'error'); return; } if (data.length === 0) { this.setStatus('Array is empty', 'error'); return; } const headers = Object.keys(data[0]); let csv = ''; if (this.headerEl.checked) { csv += headers.map(h => this.escapeCSV(h)).join(',') + '\n'; } data.forEach(row => { csv += headers.map(h => this.escapeCSV(row[h])).join(',') + '\n'; }); this.csvEl.value = csv.trim(); this.setStatus(`Converted ${data.length} row(s)`, 'success'); } catch (e) { this.setStatus('Invalid JSON: ' + e.message, 'error'); } }
  async copy() { if (!this.csvEl.value) { this.setStatus('Nothing to copy', 'error'); return; } await navigator.clipboard.writeText(this.csvEl.value); this.setStatus('Copied to clipboard!', 'success'); }
}
document.addEventListener('DOMContentLoaded', () => new JsonToCsv());
