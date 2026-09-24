// MIME Types Reference - Popup Script
class MimeTypesRef {
  constructor() { this.mimeTypes = [{ext:'.html',type:'text/html'},{ext:'.css',type:'text/css'},{ext:'.js',type:'application/javascript'},{ext:'.json',type:'application/json'},{ext:'.xml',type:'application/xml'},{ext:'.txt',type:'text/plain'},{ext:'.csv',type:'text/csv'},{ext:'.pdf',type:'application/pdf'},{ext:'.zip',type:'application/zip'},{ext:'.gz',type:'application/gzip'},{ext:'.tar',type:'application/x-tar'},{ext:'.png',type:'image/png'},{ext:'.jpg',type:'image/jpeg'},{ext:'.jpeg',type:'image/jpeg'},{ext:'.gif',type:'image/gif'},{ext:'.svg',type:'image/svg+xml'},{ext:'.webp',type:'image/webp'},{ext:'.ico',type:'image/x-icon'},{ext:'.mp3',type:'audio/mpeg'},{ext:'.wav',type:'audio/wav'},{ext:'.ogg',type:'audio/ogg'},{ext:'.mp4',type:'video/mp4'},{ext:'.webm',type:'video/webm'},{ext:'.mov',type:'video/quicktime'},{ext:'.avi',type:'video/x-msvideo'},{ext:'.woff',type:'font/woff'},{ext:'.woff2',type:'font/woff2'},{ext:'.ttf',type:'font/ttf'},{ext:'.otf',type:'font/otf'},{ext:'.eot',type:'application/vnd.ms-fontobject'},{ext:'.doc',type:'application/msword'},{ext:'.docx',type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},{ext:'.xls',type:'application/vnd.ms-excel'},{ext:'.xlsx',type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},{ext:'.ppt',type:'application/vnd.ms-powerpoint'},{ext:'.pptx',type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.mimeList = document.getElementById('mimeList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const query = this.search.value.toLowerCase(); const filtered = this.mimeTypes.filter(m => m.ext.toLowerCase().includes(query) || m.type.toLowerCase().includes(query)); this.mimeList.innerHTML = filtered.map(m => `<div class="mime-item" data-copy="${auditCopyAttribute(m.type)}" role="button" tabindex="0"><span class="mime-ext">${m.ext}</span><span class="mime-type">${m.type}</span></div>`).join(''); }
}
document.addEventListener('DOMContentLoaded', () => new MimeTypesRef());

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
