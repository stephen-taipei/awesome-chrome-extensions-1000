// CORS Reference - Popup Script
class CORSRef {
  constructor() {
    this.headers = [
      {name:'Access-Control-Allow-Origin',desc:'Specifies allowed origins',example:'*, https://example.com'},
      {name:'Access-Control-Allow-Methods',desc:'Allowed HTTP methods',example:'GET, POST, PUT, DELETE'},
      {name:'Access-Control-Allow-Headers',desc:'Allowed request headers',example:'Content-Type, Authorization'},
      {name:'Access-Control-Allow-Credentials',desc:'Allow cookies/auth headers',example:'true'},
      {name:'Access-Control-Expose-Headers',desc:'Headers visible to client',example:'X-Custom-Header'},
      {name:'Access-Control-Max-Age',desc:'Preflight cache duration (seconds)',example:'86400'},
      {name:'Origin',desc:'Request origin (sent by browser)',example:'https://client.com'},
      {name:'Access-Control-Request-Method',desc:'Method for preflight check',example:'PUT'},
      {name:'Access-Control-Request-Headers',desc:'Headers for preflight check',example:'X-Custom'}
    ];
    this.render();
  }
  render() {
    document.getElementById('headers').innerHTML = this.headers.map(h => `<div class="header-item" data-copy="${auditCopyAttribute(h.name)}" role="button" tabindex="0"><div class="header-name">${h.name}</div><div class="header-desc">${h.desc}</div><div class="header-example">${h.example}</div></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new CORSRef());

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
