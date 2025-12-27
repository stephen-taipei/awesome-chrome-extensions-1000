// Diff Checker - Popup Script
class DiffChecker {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.originalEl = document.getElementById('original'); this.modifiedEl = document.getElementById('modified'); this.compareBtn = document.getElementById('compareBtn'); this.clearBtn = document.getElementById('clearBtn'); this.statsEl = document.getElementById('stats'); this.resultEl = document.getElementById('diffResult'); }
  bindEvents() { this.compareBtn.addEventListener('click', () => this.compare()); this.clearBtn.addEventListener('click', () => this.clear()); }
  escapeHtml(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  compare() { const orig = this.originalEl.value.split('\n'); const mod = this.modifiedEl.value.split('\n'); if (!orig[0] && !mod[0]) { this.resultEl.innerHTML = '<div class="no-diff">Enter text to compare</div>'; return; } let html = ''; let adds = 0, dels = 0; const maxLen = Math.max(orig.length, mod.length); for (let i = 0; i < maxLen; i++) { const o = orig[i] || ''; const m = mod[i] || ''; if (o === m) { html += `<div class="diff-same">${this.escapeHtml(o) || '&nbsp;'}</div>`; } else { if (o) { html += `<div class="diff-del">- ${this.escapeHtml(o)}</div>`; dels++; } if (m) { html += `<div class="diff-add">+ ${this.escapeHtml(m)}</div>`; adds++; } } } this.resultEl.innerHTML = html || '<div class="no-diff">No differences found</div>'; this.statsEl.textContent = adds === 0 && dels === 0 ? 'Texts are identical' : `+${adds} additions, -${dels} deletions`; }
  clear() { this.originalEl.value = ''; this.modifiedEl.value = ''; this.resultEl.innerHTML = ''; this.statsEl.textContent = ''; }
}
document.addEventListener('DOMContentLoaded', () => new DiffChecker());
