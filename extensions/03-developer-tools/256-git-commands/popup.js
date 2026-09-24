// Git Commands - Popup Script
class GitCommands {
  constructor() { this.commands = [{cmd:'git init',desc:'Initialize new repository'},{cmd:'git clone <url>',desc:'Clone a repository'},{cmd:'git status',desc:'Show working tree status'},{cmd:'git add .',desc:'Stage all changes'},{cmd:'git add <file>',desc:'Stage specific file'},{cmd:'git commit -m "<msg>"',desc:'Commit with message'},{cmd:'git push',desc:'Push to remote'},{cmd:'git pull',desc:'Pull from remote'},{cmd:'git fetch',desc:'Fetch remote changes'},{cmd:'git branch',desc:'List branches'},{cmd:'git branch <name>',desc:'Create branch'},{cmd:'git checkout <branch>',desc:'Switch branch'},{cmd:'git checkout -b <name>',desc:'Create & switch branch'},{cmd:'git merge <branch>',desc:'Merge branch'},{cmd:'git rebase <branch>',desc:'Rebase onto branch'},{cmd:'git log',desc:'View commit history'},{cmd:'git log --oneline',desc:'Compact log view'},{cmd:'git diff',desc:'Show unstaged changes'},{cmd:'git diff --staged',desc:'Show staged changes'},{cmd:'git stash',desc:'Stash changes'},{cmd:'git stash pop',desc:'Apply stashed changes'},{cmd:'git reset HEAD~1',desc:'Undo last commit (keep changes)'},{cmd:'git reset --hard HEAD~1',desc:'Undo last commit (discard)'},{cmd:'git cherry-pick <hash>',desc:'Apply specific commit'},{cmd:'git remote -v',desc:'List remotes'},{cmd:'git tag <name>',desc:'Create tag'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('cmdList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.commands.filter(c => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(c => `<div class="cmd-item" data-copy="${auditCopyAttribute(c.cmd)}" role="button" tabindex="0"><div class="cmd-name">${this.escapeHtml(c.cmd)}</div><div class="cmd-desc">${c.desc}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new GitCommands());

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
