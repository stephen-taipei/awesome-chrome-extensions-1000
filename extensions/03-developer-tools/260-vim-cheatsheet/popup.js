// Vim Cheatsheet - Popup Script
class VimCheatsheet {
  constructor() { this.commands = [{cmd:'h j k l',desc:'Move left/down/up/right',cat:'nav'},{cmd:'w',desc:'Next word',cat:'nav'},{cmd:'b',desc:'Previous word',cat:'nav'},{cmd:'0',desc:'Start of line',cat:'nav'},{cmd:'$',desc:'End of line',cat:'nav'},{cmd:'gg',desc:'Go to first line',cat:'nav'},{cmd:'G',desc:'Go to last line',cat:'nav'},{cmd:':<n>',desc:'Go to line n',cat:'nav'},{cmd:'Ctrl+f',desc:'Page down',cat:'nav'},{cmd:'Ctrl+b',desc:'Page up',cat:'nav'},{cmd:'%',desc:'Jump to matching bracket',cat:'nav'},{cmd:'i',desc:'Insert before cursor',cat:'edit'},{cmd:'I',desc:'Insert at line start',cat:'edit'},{cmd:'a',desc:'Insert after cursor',cat:'edit'},{cmd:'A',desc:'Insert at line end',cat:'edit'},{cmd:'o',desc:'New line below',cat:'edit'},{cmd:'O',desc:'New line above',cat:'edit'},{cmd:'x',desc:'Delete character',cat:'edit'},{cmd:'dd',desc:'Delete line',cat:'edit'},{cmd:'dw',desc:'Delete word',cat:'edit'},{cmd:'D',desc:'Delete to line end',cat:'edit'},{cmd:'yy',desc:'Copy line',cat:'edit'},{cmd:'yw',desc:'Copy word',cat:'edit'},{cmd:'p',desc:'Paste after',cat:'edit'},{cmd:'P',desc:'Paste before',cat:'edit'},{cmd:'u',desc:'Undo',cat:'edit'},{cmd:'Ctrl+r',desc:'Redo',cat:'edit'},{cmd:'.',desc:'Repeat last command',cat:'edit'},{cmd:'r<c>',desc:'Replace character',cat:'edit'},{cmd:'cw',desc:'Change word',cat:'edit'},{cmd:'cc',desc:'Change line',cat:'edit'},{cmd:'ciw',desc:'Change inner word',cat:'edit'},{cmd:':w',desc:'Save file',cat:'file'},{cmd:':q',desc:'Quit',cat:'file'},{cmd:':wq',desc:'Save and quit',cat:'file'},{cmd:':q!',desc:'Quit without saving',cat:'file'},{cmd:':e <file>',desc:'Open file',cat:'file'},{cmd:'/<pattern>',desc:'Search forward',cat:'file'},{cmd:'?<pattern>',desc:'Search backward',cat:'file'},{cmd:'n',desc:'Next search result',cat:'file'},{cmd:'N',desc:'Previous search result',cat:'file'},{cmd:':%s/old/new/g',desc:'Replace all',cat:'file'}]; this.cat = 'all'; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('cmdList'); this.tabs = document.querySelectorAll('.tab'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); this.tabs.forEach(t => t.addEventListener('click', () => { this.tabs.forEach(x => x.classList.remove('active')); t.classList.add('active'); this.cat = t.dataset.cat; this.render(); })); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.commands.filter(c => (this.cat === 'all' || c.cat === this.cat) && (c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))); this.list.innerHTML = filtered.map(c => `<div class="cmd-item" data-copy="${auditCopyAttribute(c.cmd)}" role="button" tabindex="0"><div class="cmd-name">${this.escapeHtml(c.cmd)}</div><div class="cmd-desc">${c.desc}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new VimCheatsheet());

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
