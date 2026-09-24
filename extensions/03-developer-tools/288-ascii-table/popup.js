// ASCII Table - Popup Script
class ASCIITable {
  constructor() { this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.table = document.getElementById('table'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() {
    const q = this.search.value.toLowerCase();
    const items = [];
    for (let i = 32; i < 127; i++) {
      const char = String.fromCharCode(i);
      const dec = i.toString();
      const hex = i.toString(16).toUpperCase().padStart(2, '0');
      if (q && !char.toLowerCase().includes(q) && !dec.includes(q) && !hex.toLowerCase().includes(q)) continue;
      items.push({ char, dec, hex, code: i });
    }
    this.table.innerHTML = items.map(item => `<div class="ascii-item" data-copy="${auditCopyAttribute(item.char)}" role="button" tabindex="0"><div class="ascii-char">${item.char === '<' ? '&lt;' : item.char === '>' ? '&gt;' : item.char}</div><div class="ascii-dec">${item.dec}</div><div class="ascii-hex">0x${item.hex}</div></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new ASCIITable());

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
