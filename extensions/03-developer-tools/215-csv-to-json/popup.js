// CSV to JSON - Popup Script
class CsvToJson {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.csvEl = document.getElementById('csvInput'); this.jsonEl = document.getElementById('jsonOutput'); this.headerEl = document.getElementById('hasHeader'); this.convertBtn = document.getElementById('convertBtn'); this.copyBtn = document.getElementById('copyBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.convertBtn.addEventListener('click', () => this.convert()); this.copyBtn.addEventListener('click', () => this.copy()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  parseCSV(csv) { const lines = csv.trim().split('\n'); const result = []; const hasHeader = this.headerEl.checked; let headers = []; if (hasHeader && lines.length > 0) { headers = this.parseLine(lines.shift()); } lines.forEach((line, idx) => { const values = this.parseLine(line); if (hasHeader) { const obj = {}; headers.forEach((h, i) => { obj[h] = values[i] || ''; }); result.push(obj); } else { result.push(values); } }); return result; }
  parseLine(line) { const result = []; let current = ''; let inQuotes = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { inQuotes = !inQuotes; } else if (c === ',' && !inQuotes) { result.push(current.trim()); current = ''; } else { current += c; } } result.push(current.trim()); return result; }
  convert() { const csv = this.csvEl.value; if (!csv.trim()) { this.setStatus('Please enter CSV data', 'error'); return; } try { const json = this.parseCSV(csv); this.jsonEl.value = JSON.stringify(json, null, 2); this.setStatus(`Converted ${json.length} row(s)`, 'success'); } catch (e) { this.setStatus('Error: ' + e.message, 'error'); } }
  async copy() { if (!this.jsonEl.value) { this.setStatus('Nothing to copy', 'error'); return; } await navigator.clipboard.writeText(this.jsonEl.value); this.setStatus('Copied to clipboard!', 'success'); }
}
document.addEventListener('DOMContentLoaded', () => new CsvToJson());
