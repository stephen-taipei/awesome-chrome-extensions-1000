// NPM Commands - Popup Script
class NpmCommands {
  constructor() { this.commands = [{cmd:'npm init',desc:'Initialize package.json'},{cmd:'npm init -y',desc:'Quick init with defaults'},{cmd:'npm install',desc:'Install all dependencies'},{cmd:'npm install <pkg>',desc:'Install package'},{cmd:'npm install -D <pkg>',desc:'Install as devDependency'},{cmd:'npm install -g <pkg>',desc:'Install globally'},{cmd:'npm uninstall <pkg>',desc:'Remove package'},{cmd:'npm update',desc:'Update all packages'},{cmd:'npm update <pkg>',desc:'Update specific package'},{cmd:'npm run <script>',desc:'Run npm script'},{cmd:'npm start',desc:'Run start script'},{cmd:'npm test',desc:'Run test script'},{cmd:'npm run build',desc:'Run build script'},{cmd:'npm list',desc:'List installed packages'},{cmd:'npm list -g',desc:'List global packages'},{cmd:'npm outdated',desc:'Check outdated packages'},{cmd:'npm audit',desc:'Security audit'},{cmd:'npm audit fix',desc:'Fix vulnerabilities'},{cmd:'npm cache clean --force',desc:'Clear npm cache'},{cmd:'npm publish',desc:'Publish package'},{cmd:'npm version <type>',desc:'Bump version'},{cmd:'npm link',desc:'Symlink package'},{cmd:'npx <cmd>',desc:'Run package command'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('cmdList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.commands.filter(c => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(c => `<div class="cmd-item" data-copy="${auditCopyAttribute(c.cmd)}" role="button" tabindex="0"><div class="cmd-name">${this.escapeHtml(c.cmd)}</div><div class="cmd-desc">${c.desc}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new NpmCommands());

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
