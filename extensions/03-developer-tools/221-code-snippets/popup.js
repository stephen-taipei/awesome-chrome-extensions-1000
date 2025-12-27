// Code Snippets - Popup Script
class CodeSnippets {
  constructor() { this.snippets = []; this.initElements(); this.bindEvents(); this.loadData(); }
  initElements() { this.titleEl = document.getElementById('title'); this.langEl = document.getElementById('language'); this.codeEl = document.getElementById('code'); this.saveBtn = document.getElementById('saveBtn'); this.listEl = document.getElementById('snippetList'); }
  bindEvents() { this.saveBtn.addEventListener('click', () => this.save()); }
  async loadData() { const r = await chrome.storage.local.get('codeSnippets'); if (r.codeSnippets) this.snippets = r.codeSnippets; this.render(); }
  async saveData() { await chrome.storage.local.set({ codeSnippets: this.snippets }); }
  save() { const title = this.titleEl.value.trim(); const code = this.codeEl.value.trim(); if (!title || !code) return; this.snippets.unshift({ id: Date.now(), title, language: this.langEl.value, code, created: Date.now() }); if (this.snippets.length > 20) this.snippets.pop(); this.saveData(); this.render(); this.titleEl.value = ''; this.codeEl.value = ''; }
  async copy(id) { const s = this.snippets.find(s => s.id === id); if (s) await navigator.clipboard.writeText(s.code); }
  delete(id) { this.snippets = this.snippets.filter(s => s.id !== id); this.saveData(); this.render(); }
  escapeHtml(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  truncate(t, l = 30) { return t.length <= l ? t : t.substring(0, l) + '...'; }
  render() { if (!this.snippets.length) { this.listEl.innerHTML = '<div class="empty-state">No snippets saved</div>'; return; } this.listEl.innerHTML = this.snippets.map(s => `<div class="snippet-item"><div class="snippet-header"><span class="snippet-title">${this.escapeHtml(this.truncate(s.title))}</span><span class="snippet-lang">${s.language}</span></div><div class="snippet-actions"><button data-copy="${s.id}">Copy</button><button data-del="${s.id}">Del</button></div></div>`).join(''); this.listEl.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => this.copy(parseInt(b.dataset.copy)))); this.listEl.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => this.delete(parseInt(b.dataset.del)))); }
}
document.addEventListener('DOMContentLoaded', () => new CodeSnippets());
