// Request Logger - Popup Script
class RequestLogger {
  constructor() { this.requests = []; this.initElements(); this.bindEvents(); this.loadRequests(); }
  initElements() { this.countEl = document.getElementById('count'); this.requestList = document.getElementById('requestList'); this.refreshBtn = document.getElementById('refreshBtn'); this.clearBtn = document.getElementById('clearBtn'); this.filterInput = document.getElementById('filter'); }
  bindEvents() { this.refreshBtn.addEventListener('click', () => this.loadRequests()); this.clearBtn.addEventListener('click', () => this.clearRequests()); this.filterInput.addEventListener('input', () => this.render()); }
  async loadRequests() { this.requests = await chrome.runtime.sendMessage({ action: 'getRequests' }); this.render(); }
  async clearRequests() { await chrome.runtime.sendMessage({ action: 'clearRequests' }); this.requests = []; this.render(); }
  render() { const query = this.filterInput.value.toLowerCase(); const filtered = this.requests.filter(r => r.url.toLowerCase().includes(query)); this.countEl.textContent = `${filtered.length} requests`; if (filtered.length === 0) { this.requestList.innerHTML = '<div style="color:#9ca3af;font-size:11px;padding:10px;">No requests logged</div>'; return; } this.requestList.innerHTML = filtered.map(r => { const statusClass = r.status >= 200 && r.status < 400 ? 'success' : 'error'; return `<div class="request-item"><div class="request-header"><span class="method">${r.method}</span><span class="status ${statusClass}">${r.status}</span><span class="type">${r.type}</span></div><div class="request-url">${this.escapeHtml(this.shortenUrl(r.url))}</div></div>`; }).join(''); }
  shortenUrl(url) { try { const u = new URL(url); return u.pathname + u.search; } catch { return url; } }
  escapeHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
}
document.addEventListener('DOMContentLoaded', () => new RequestLogger());
