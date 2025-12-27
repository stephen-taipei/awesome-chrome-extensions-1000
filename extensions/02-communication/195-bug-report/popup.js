// Bug Report - Popup Script
class BugReport {
  constructor() { this.reports = []; this.initElements(); this.bindEvents(); this.loadData(); }
  initElements() {
    this.severityEl = document.getElementById('severity'); this.titleEl = document.getElementById('title');
    this.descriptionEl = document.getElementById('description'); this.stepsEl = document.getElementById('steps');
    this.expectedEl = document.getElementById('expected'); this.environmentEl = document.getElementById('environment');
    this.copyBtn = document.getElementById('copyReport'); this.saveBtn = document.getElementById('saveReport');
    this.listEl = document.getElementById('reportList');
  }
  bindEvents() { this.copyBtn.addEventListener('click', () => this.copyReport()); this.saveBtn.addEventListener('click', () => this.saveReport()); }
  async loadData() { const result = await chrome.storage.local.get('bugReports'); if (result.bugReports) this.reports = result.bugReports; this.render(); }
  async saveData() { await chrome.storage.local.set({ bugReports: this.reports }); }
  formatReport() {
    const severity = this.severityEl.value; const title = this.titleEl.value.trim();
    const description = this.descriptionEl.value.trim(); const steps = this.stepsEl.value.trim();
    const expected = this.expectedEl.value.trim(); const environment = this.environmentEl.value.trim();
    let report = `🐛 Bug Report: ${title || 'Untitled'}\n\n`;
    report += `Severity: ${severity.toUpperCase()}\n\n`;
    if (description) report += `Description:\n${description}\n\n`;
    if (steps) report += `Steps to Reproduce:\n${steps}\n\n`;
    if (expected) report += `Expected Behavior: ${expected}\n\n`;
    if (environment) report += `Environment: ${environment}\n\n`;
    return report;
  }
  async copyReport() { await navigator.clipboard.writeText(this.formatReport()); const original = this.copyBtn.textContent; this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = original; }, 1500); }
  saveReport() {
    const title = this.titleEl.value.trim(); if (!title) return;
    this.reports.unshift({ id: Date.now(), severity: this.severityEl.value, title, description: this.descriptionEl.value.trim(), steps: this.stepsEl.value.trim(), expected: this.expectedEl.value.trim(), environment: this.environmentEl.value.trim(), created: Date.now() });
    if (this.reports.length > 15) this.reports.pop(); this.saveData(); this.render();
    const original = this.saveBtn.textContent; this.saveBtn.textContent = 'Saved!'; setTimeout(() => { this.saveBtn.textContent = original; }, 1500);
  }
  loadReport(id) { const r = this.reports.find(r => r.id === id); if (r) { this.severityEl.value = r.severity || 'medium'; this.titleEl.value = r.title || ''; this.descriptionEl.value = r.description || ''; this.stepsEl.value = r.steps || ''; this.expectedEl.value = r.expected || ''; this.environmentEl.value = r.environment || ''; } }
  deleteReport(id) { this.reports = this.reports.filter(r => r.id !== id); this.saveData(); this.render(); }
  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  truncate(text, len = 25) { return (!text || text.length <= len) ? (text || '') : text.substring(0, len) + '...'; }
  render() {
    if (this.reports.length === 0) { this.listEl.innerHTML = '<div class="empty-state">No saved reports</div>'; return; }
    this.listEl.innerHTML = this.reports.map(r => `<div class="report-item"><div class="report-info"><div class="report-title">${this.escapeHtml(this.truncate(r.title))}</div><div class="report-severity">${r.severity}</div></div><div class="report-actions"><button class="load-btn" data-load="${r.id}">Load</button><button class="delete-btn" data-delete="${r.id}">Del</button></div></div>`).join('');
    this.listEl.querySelectorAll('[data-load]').forEach(btn => btn.addEventListener('click', () => this.loadReport(parseInt(btn.dataset.load))));
    this.listEl.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => this.deleteReport(parseInt(btn.dataset.delete))));
  }
}
document.addEventListener('DOMContentLoaded', () => new BugReport());
