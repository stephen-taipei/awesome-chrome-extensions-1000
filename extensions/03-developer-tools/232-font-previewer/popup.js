// Font Previewer - Popup Script
class FontPreviewer {
  constructor() { this.fonts = ['Arial','Arial Black','Verdana','Tahoma','Trebuchet MS','Georgia','Times New Roman','Palatino Linotype','Courier New','Lucida Console','Monaco','Comic Sans MS','Impact','Helvetica','Garamond','Book Antiqua','Lucida Sans','system-ui','sans-serif','serif','monospace','cursive','fantasy']; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.previewText = document.getElementById('previewText'); this.fontSize = document.getElementById('fontSize'); this.sizeLabel = document.getElementById('sizeLabel'); this.fontList = document.getElementById('fontList'); }
  bindEvents() { this.previewText.addEventListener('input', () => this.render()); this.fontSize.addEventListener('input', () => { this.sizeLabel.textContent = this.fontSize.value + 'px'; this.render(); }); }
  render() { const text = this.previewText.value || 'The quick brown fox jumps'; const size = this.fontSize.value + 'px'; this.fontList.innerHTML = this.fonts.map(font => `<div class="font-item" data-copy="${auditCopyAttribute('font-family: ' + font + ';')}" role="button" tabindex="0"><div class="font-name">${font}</div><div class="font-preview" style="font-family: '${font}'; font-size: ${size}">${this.escapeHtml(text)}</div></div>`).join(''); }
  escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new FontPreviewer());

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
