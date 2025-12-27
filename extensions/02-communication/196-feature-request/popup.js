// Feature Request - Popup Script
class FeatureRequest {
  constructor() { this.requests = []; this.initElements(); this.bindEvents(); this.loadData(); }
  initElements() { this.priorityEl = document.getElementById('priority'); this.titleEl = document.getElementById('title'); this.descriptionEl = document.getElementById('description'); this.useCaseEl = document.getElementById('useCase'); this.benefitsEl = document.getElementById('benefits'); this.copyBtn = document.getElementById('copyRequest'); this.saveBtn = document.getElementById('saveRequest'); this.listEl = document.getElementById('requestList'); }
  bindEvents() { this.copyBtn.addEventListener('click', () => this.copyRequest()); this.saveBtn.addEventListener('click', () => this.saveRequest()); }
  async loadData() { const result = await chrome.storage.local.get('featureRequests'); if (result.featureRequests) this.requests = result.featureRequests; this.render(); }
  async saveData() { await chrome.storage.local.set({ featureRequests: this.requests }); }
  formatRequest() {
    const title = this.titleEl.value.trim(); const description = this.descriptionEl.value.trim();
    const useCase = this.useCaseEl.value.trim(); const benefits = this.benefitsEl.value.trim();
    let req = `✨ Feature Request: ${title || 'New Feature'}\n\nPriority: ${this.priorityEl.value.toUpperCase()}\n\n`;
    if (description) req += `Description:\n${description}\n\n`;
    if (useCase) req += `Use Case:\n${useCase}\n\n`;
    if (benefits) req += `Benefits:\n${benefits}\n\n`;
    req += 'Thank you for considering this feature!';
    return req;
  }
  async copyRequest() { await navigator.clipboard.writeText(this.formatRequest()); const o = this.copyBtn.textContent; this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = o; }, 1500); }
  saveRequest() { const title = this.titleEl.value.trim(); if (!title) return; this.requests.unshift({ id: Date.now(), priority: this.priorityEl.value, title, description: this.descriptionEl.value.trim(), useCase: this.useCaseEl.value.trim(), benefits: this.benefitsEl.value.trim(), created: Date.now() }); if (this.requests.length > 15) this.requests.pop(); this.saveData(); this.render(); const o = this.saveBtn.textContent; this.saveBtn.textContent = 'Saved!'; setTimeout(() => { this.saveBtn.textContent = o; }, 1500); }
  loadRequest(id) { const r = this.requests.find(r => r.id === id); if (r) { this.priorityEl.value = r.priority || 'medium'; this.titleEl.value = r.title || ''; this.descriptionEl.value = r.description || ''; this.useCaseEl.value = r.useCase || ''; this.benefitsEl.value = r.benefits || ''; } }
  deleteRequest(id) { this.requests = this.requests.filter(r => r.id !== id); this.saveData(); this.render(); }
  escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  truncate(t, l = 25) { return (!t || t.length <= l) ? (t || '') : t.substring(0, l) + '...'; }
  render() { if (this.requests.length === 0) { this.listEl.innerHTML = '<div class="empty-state">No saved requests</div>'; return; } this.listEl.innerHTML = this.requests.map(r => `<div class="request-item"><div class="request-info"><div class="request-title">${this.escapeHtml(this.truncate(r.title))}</div><div class="request-priority">${r.priority}</div></div><div class="request-actions"><button class="load-btn" data-load="${r.id}">Load</button><button class="delete-btn" data-delete="${r.id}">Del</button></div></div>`).join(''); this.listEl.querySelectorAll('[data-load]').forEach(b => b.addEventListener('click', () => this.loadRequest(parseInt(b.dataset.load)))); this.listEl.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => this.deleteRequest(parseInt(b.dataset.delete)))); }
}
document.addEventListener('DOMContentLoaded', () => new FeatureRequest());
