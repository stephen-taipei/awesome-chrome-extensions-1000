// Regex Tester - Popup Script
class RegexTester {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.patternEl = document.getElementById('pattern'); this.flagsEl = document.getElementById('flags'); this.testEl = document.getElementById('testString'); this.testBtn = document.getElementById('testBtn'); this.clearBtn = document.getElementById('clearBtn'); this.statusEl = document.getElementById('status'); this.matchesEl = document.getElementById('matches'); }
  bindEvents() { this.testBtn.addEventListener('click', () => this.test()); this.clearBtn.addEventListener('click', () => this.clear()); this.patternEl.addEventListener('input', () => this.test()); this.testEl.addEventListener('input', () => this.test()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  test() { const pattern = this.patternEl.value; const flags = this.flagsEl.value; const test = this.testEl.value; if (!pattern) { this.matchesEl.innerHTML = '<div class="no-match">Enter a pattern</div>'; this.statusEl.textContent = ''; return; } try { const regex = new RegExp(pattern, flags); const matches = [...test.matchAll(regex)]; if (matches.length === 0) { this.matchesEl.innerHTML = '<div class="no-match">No matches found</div>'; this.setStatus('Valid regex, no matches', 'success'); } else { this.matchesEl.innerHTML = matches.map((m, i) => `<div class="match"><span class="match-index">[${i}]</span> <span class="match-value">${this.escapeHtml(m[0])}</span> at ${m.index}</div>`).join(''); this.setStatus(`${matches.length} match(es) found`, 'success'); } } catch (e) { this.matchesEl.innerHTML = '<div class="no-match">Invalid regex</div>'; this.setStatus('Error: ' + e.message, 'error'); } }
  clear() { this.patternEl.value = ''; this.testEl.value = ''; this.matchesEl.innerHTML = '<div class="no-match">Enter a pattern</div>'; this.statusEl.textContent = ''; }
}
document.addEventListener('DOMContentLoaded', () => new RegexTester());
