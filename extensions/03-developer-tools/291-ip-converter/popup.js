// IP Converter - Popup Script
class IPConverter {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('ip'); this.btn = document.getElementById('convert'); this.result = document.getElementById('result'); }
  bindEvents() { this.btn.addEventListener('click', () => this.convert()); this.input.addEventListener('keypress', e => { if (e.key === 'Enter') this.convert(); }); }
  convert() {
    const ip = this.input.value.trim();
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      this.result.innerHTML = '<div style="color:#f87171">Invalid IPv4 address</div>'; return;
    }
    const decimal = ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
    const hex = parts.map(p => p.toString(16).padStart(2, '0').toUpperCase()).join('.');
    const binary = parts.map(p => p.toString(2).padStart(8, '0')).join('.');
    const octal = parts.map(p => p.toString(8)).join('.');
    this.result.innerHTML = `
      <div class="result-row"><span class="result-label">Decimal</span><span class="result-value" data-copy="${auditCopyAttribute(decimal)}" role="button" tabindex="0">${decimal}</span></div>
      <div class="result-row"><span class="result-label">Hexadecimal</span><span class="result-value" data-copy="${auditCopyAttribute(hex)}" role="button" tabindex="0">${hex}</span></div>
      <div class="result-row"><span class="result-label">Binary</span><span class="result-value" data-copy="${auditCopyAttribute(binary)}" role="button" tabindex="0">${binary}</span></div>
      <div class="result-row"><span class="result-label">Octal</span><span class="result-value" data-copy="${auditCopyAttribute(octal)}" role="button" tabindex="0">${octal}</span></div>
    `;
  }
}
document.addEventListener('DOMContentLoaded', () => new IPConverter());

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
