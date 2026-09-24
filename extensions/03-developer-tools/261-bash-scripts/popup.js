// Bash Scripts - Popup Script
class BashScripts {
  constructor() { this.scripts = [{name:'Shebang',code:'#!/bin/bash'},{name:'Variables',code:'NAME="value"\necho $NAME'},{name:'Read Input',code:'read -p "Enter: " VAR\necho $VAR'},{name:'If Statement',code:'if [ "$VAR" = "value" ]; then\n  echo "match"\nfi'},{name:'If-Else',code:'if [ -f "$FILE" ]; then\n  echo "exists"\nelse\n  echo "not found"\nfi'},{name:'For Loop',code:'for i in 1 2 3; do\n  echo $i\ndone'},{name:'For Range',code:'for i in {1..10}; do\n  echo $i\ndone'},{name:'While Loop',code:'while [ $i -lt 10 ]; do\n  echo $i\n  ((i++))\ndone'},{name:'Case Statement',code:'case $VAR in\n  "a") echo "A";;\n  "b") echo "B";;\n  *) echo "Other";;\nesac'},{name:'Function',code:'my_func() {\n  echo "Hello $1"\n}\nmy_func "World"'},{name:'Array',code:'arr=("one" "two" "three")\necho ${arr[0]}\necho ${arr[@]}'},{name:'Check File Exists',code:'if [ -f "file.txt" ]; then\n  echo "File exists"\nfi'},{name:'Check Dir Exists',code:'if [ -d "mydir" ]; then\n  echo "Dir exists"\nfi'},{name:'Command Args',code:'echo "Script: $0"\necho "First arg: $1"\necho "All args: $@"'},{name:'Exit Status',code:'command\nif [ $? -eq 0 ]; then\n  echo "Success"\nfi'},{name:'String Length',code:'str="hello"\necho ${#str}'},{name:'Substring',code:'str="hello world"\necho ${str:0:5}'},{name:'Find Replace',code:'str="hello"\necho ${str/l/L}'},{name:'Date',code:'DATE=$(date +"%Y-%m-%d")\necho $DATE'}]; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('scriptList'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.scripts.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)); this.list.innerHTML = filtered.map(s => `<div class="script-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="script-name">${s.name}</div><div class="script-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new BashScripts());

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
