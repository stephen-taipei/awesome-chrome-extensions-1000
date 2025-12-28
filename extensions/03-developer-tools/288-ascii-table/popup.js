// ASCII Table - Popup Script
class ASCIITable {
  constructor() { this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.search = document.getElementById('search'); this.table = document.getElementById('table'); }
  bindEvents() { this.search.addEventListener('input', () => this.render()); }
  render() {
    const q = this.search.value.toLowerCase();
    const items = [];
    for (let i = 32; i < 127; i++) {
      const char = String.fromCharCode(i);
      const dec = i.toString();
      const hex = i.toString(16).toUpperCase().padStart(2, '0');
      if (q && !char.toLowerCase().includes(q) && !dec.includes(q) && !hex.toLowerCase().includes(q)) continue;
      items.push({ char, dec, hex, code: i });
    }
    this.table.innerHTML = items.map(item => `<div class="ascii-item" onclick="navigator.clipboard.writeText('${item.char === "'" ? "\\'" : item.char}')"><div class="ascii-char">${item.char === '<' ? '&lt;' : item.char === '>' ? '&gt;' : item.char}</div><div class="ascii-dec">${item.dec}</div><div class="ascii-hex">0x${item.hex}</div></div>`).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => new ASCIITable());
