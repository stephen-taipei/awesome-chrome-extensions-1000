// ASCII Table - Popup Script
class AsciiTable {
  constructor() { this.initElements(); this.bindEvents(); this.renderTable(); }
  initElements() { this.searchEl = document.getElementById('search'); this.charEl = document.getElementById('charInput'); this.decEl = document.getElementById('decInput'); this.hexEl = document.getElementById('hexInput'); this.tableEl = document.getElementById('asciiTable'); }
  bindEvents() { this.searchEl.addEventListener('input', () => this.filter()); this.charEl.addEventListener('input', () => this.convertFromChar()); this.decEl.addEventListener('input', () => this.convertFromDec()); this.hexEl.addEventListener('input', () => this.convertFromHex()); }
  getCharDisplay(code) { if (code < 32) { const names = ['NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','TAB','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US']; return names[code]; } if (code === 32) return 'SP'; if (code === 127) return 'DEL'; return String.fromCharCode(code); }
  renderTable(filter = '') { this.tableEl.innerHTML = ''; for (let i = 32; i < 127; i++) { const char = String.fromCharCode(i); const display = this.getCharDisplay(i); if (filter && !display.toLowerCase().includes(filter) && !i.toString().includes(filter)) continue; const cell = document.createElement('div'); cell.className = 'ascii-cell'; cell.innerHTML = `<div class="char">${this.escapeHtml(display)}</div><div class="code">${i}</div>`; cell.addEventListener('click', () => this.selectChar(i)); this.tableEl.appendChild(cell); } }
  escapeHtml(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  filter() { this.renderTable(this.searchEl.value.toLowerCase()); }
  selectChar(code) { this.charEl.value = String.fromCharCode(code); this.decEl.value = code; this.hexEl.value = code.toString(16).toUpperCase(); }
  convertFromChar() { if (!this.charEl.value) return; const code = this.charEl.value.charCodeAt(0); this.decEl.value = code; this.hexEl.value = code.toString(16).toUpperCase(); }
  convertFromDec() { const code = parseInt(this.decEl.value); if (isNaN(code)) return; this.charEl.value = String.fromCharCode(code); this.hexEl.value = code.toString(16).toUpperCase(); }
  convertFromHex() { const code = parseInt(this.hexEl.value, 16); if (isNaN(code)) return; this.charEl.value = String.fromCharCode(code); this.decEl.value = code; }
}
document.addEventListener('DOMContentLoaded', () => new AsciiTable());
