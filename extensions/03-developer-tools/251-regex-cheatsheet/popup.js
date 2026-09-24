// Regex Cheatsheet - Popup Script
class RegexCheatsheet {
  constructor() { this.patterns = [{regex:'.',desc:'Any character except newline'},{regex:'\\d',desc:'Digit [0-9]'},{regex:'\\D',desc:'Non-digit'},{regex:'\\w',desc:'Word char [a-zA-Z0-9_]'},{regex:'\\W',desc:'Non-word char'},{regex:'\\s',desc:'Whitespace'},{regex:'\\S',desc:'Non-whitespace'},{regex:'^',desc:'Start of string'},{regex:'$',desc:'End of string'},{regex:'\\b',desc:'Word boundary'},{regex:'*',desc:'0 or more'},{regex:'+',desc:'1 or more'},{regex:'?',desc:'0 or 1 (optional)'},{regex:'{n}',desc:'Exactly n times'},{regex:'{n,}',desc:'n or more times'},{regex:'{n,m}',desc:'Between n and m times'},{regex:'[abc]',desc:'Any of a, b, or c'},{regex:'[^abc]',desc:'Not a, b, or c'},{regex:'[a-z]',desc:'Range a to z'},{regex:'(abc)',desc:'Capture group'},{regex:'(?:abc)',desc:'Non-capture group'},{regex:'a|b',desc:'a or b'},{regex:'(?=abc)',desc:'Positive lookahead'},{regex:'(?!abc)',desc:'Negative lookahead'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('patternList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const query = this.search.value.toLowerCase(); const filtered = this.patterns.filter(p => p.regex.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)); this.list.innerHTML = filtered.map(p => `<div class="pattern-item" data-copy="${auditCopyAttribute(p.regex)}" role="button" tabindex="0"><div class="pattern-regex">${this.escapeHtml(p.regex)}</div><div class="pattern-desc">${p.desc}</div></div>`).join(''); }
  escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new RegexCheatsheet());

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
