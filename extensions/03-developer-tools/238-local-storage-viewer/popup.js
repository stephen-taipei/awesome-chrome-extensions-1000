// Local Storage Viewer - Popup Script
class LocalStorageViewer {
  constructor() { this.currentTab = 'local'; this.initElements(); this.bindEvents(); this.loadData(); }
  initElements() { this.countEl = document.getElementById('count'); this.storageList = document.getElementById('storageList'); this.refreshBtn = document.getElementById('refreshBtn'); this.tabs = document.querySelectorAll('.tab'); }
  bindEvents() { this.refreshBtn.addEventListener('click', () => this.loadData()); this.tabs.forEach(tab => tab.addEventListener('click', () => { this.tabs.forEach(t => t.classList.remove('active')); tab.classList.add('active'); this.currentTab = tab.dataset.tab; this.loadData(); })); }
  async loadData() { try { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); const storageType = this.currentTab === 'local' ? 'localStorage' : 'sessionStorage'; const results = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: (type) => { const storage = type === 'localStorage' ? localStorage : sessionStorage; const items = []; for (let i = 0; i < storage.length; i++) { const key = storage.key(i); items.push({ key, value: storage.getItem(key) }); } return items; }, args: [storageType] }); this.renderData(results[0].result); } catch (e) { this.storageList.innerHTML = '<div style="color:#9ca3af;font-size:11px;padding:10px;">Unable to access storage</div>'; this.countEl.textContent = '0 items'; } }
  renderData(items) { this.countEl.textContent = `${items.length} items`; if (items.length === 0) { this.storageList.innerHTML = '<div style="color:#9ca3af;font-size:11px;padding:10px;">No data stored</div>'; return; } this.storageList.innerHTML = items.map(item => `<div class="storage-item"><div class="storage-key">${this.escapeHtml(item.key)}</div><div class="storage-value">${this.escapeHtml(this.formatValue(item.value))}</div><div class="storage-actions"><button data-copy="${auditCopyAttribute(item.value)}" role="button" tabindex="0">Copy</button></div></div>`).join(''); }
  formatValue(val) { try { const parsed = JSON.parse(val); return JSON.stringify(parsed, null, 2); } catch { return val; } }
  escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new LocalStorageViewer());

// MV3-safe copy controls: data is never interpolated into executable handlers.
function auditCopyAttribute(value) {
  return String(value ?? '').replace(/[&<>"'\r\n]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '\r': '&#13;', '\n': '&#10;'
  })[char]);
}
async function auditCopyControl(target) {
  const control = target instanceof Element ? target.closest('[data-copy]') : null;
  if (!control) return;
  let status = document.getElementById('audit-copy-status');
  if (!status) {
    status = document.createElement('p');
    status.id = 'audit-copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.appendChild(status);
  }
  try {
    await navigator.clipboard.writeText(control.dataset.copy);
    status.textContent = 'Copied to clipboard.';
  } catch {
    status.textContent = 'Clipboard access was denied. Select and copy the text manually.';
  }
}
document.addEventListener('click', event => { void auditCopyControl(event.target); });
document.addEventListener('keydown', event => {
  const control = event.target instanceof Element ? event.target.closest('[data-copy]') : null;
  if (control && control.tagName !== 'BUTTON' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    void auditCopyControl(control);
  }
});
