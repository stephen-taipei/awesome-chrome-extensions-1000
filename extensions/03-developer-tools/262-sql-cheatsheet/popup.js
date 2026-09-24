// SQL Cheatsheet - Popup Script
class SQLCheatsheet {
  constructor() { this.queries = [{name:'Select All',code:'SELECT * FROM table_name;',cat:'select'},{name:'Select Columns',code:'SELECT col1, col2 FROM table_name;',cat:'select'},{name:'Where Clause',code:'SELECT * FROM table_name\nWHERE condition;',cat:'select'},{name:'Order By',code:'SELECT * FROM table_name\nORDER BY column ASC|DESC;',cat:'select'},{name:'Limit Results',code:'SELECT * FROM table_name\nLIMIT 10;',cat:'select'},{name:'Distinct',code:'SELECT DISTINCT column\nFROM table_name;',cat:'select'},{name:'Count',code:'SELECT COUNT(*) FROM table_name;',cat:'select'},{name:'Group By',code:'SELECT column, COUNT(*)\nFROM table_name\nGROUP BY column;',cat:'select'},{name:'Having',code:'SELECT column, COUNT(*)\nFROM table_name\nGROUP BY column\nHAVING COUNT(*) > 1;',cat:'select'},{name:'Inner Join',code:'SELECT * FROM t1\nINNER JOIN t2 ON t1.id = t2.id;',cat:'select'},{name:'Left Join',code:'SELECT * FROM t1\nLEFT JOIN t2 ON t1.id = t2.id;',cat:'select'},{name:'Insert Row',code:'INSERT INTO table_name (col1, col2)\nVALUES (val1, val2);',cat:'modify'},{name:'Update Row',code:'UPDATE table_name\nSET col1 = val1\nWHERE condition;',cat:'modify'},{name:'Delete Row',code:'DELETE FROM table_name\nWHERE condition;',cat:'modify'},{name:'Create Table',code:'CREATE TABLE table_name (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);',cat:'table'},{name:'Drop Table',code:'DROP TABLE table_name;',cat:'table'},{name:'Alter Add Column',code:'ALTER TABLE table_name\nADD column_name datatype;',cat:'table'},{name:'Create Index',code:'CREATE INDEX idx_name\nON table_name (column);',cat:'table'}]; this.cat = 'all'; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.list = document.getElementById('queryList'); this.tabs = document.querySelectorAll('.tab'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); this.tabs.forEach(t => t.addEventListener('click', () => { this.tabs.forEach(x => x.classList.remove('active')); t.classList.add('active'); this.cat = t.dataset.cat; this.render(); })); }
  render() { const q = this.search.value.toLowerCase(); const filtered = this.queries.filter(s => (this.cat === 'all' || s.cat === this.cat) && (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))); this.list.innerHTML = filtered.map(s => `<div class="query-item" data-copy="${auditCopyAttribute(s.code)}" role="button" tabindex="0"><div class="query-name">${s.name}</div><div class="query-code">${this.escapeHtml(s.code)}</div></div>`).join(''); }
  escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
document.addEventListener('DOMContentLoaded', () => new SQLCheatsheet());

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
