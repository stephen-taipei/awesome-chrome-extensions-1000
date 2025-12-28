// Unicode Lookup - Popup Script
class UnicodeLookup {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('charInput'); this.result = document.getElementById('result'); }
  bindEvents() { this.input.addEventListener('input', () => this.lookup()); }
  lookup() {
    const val = this.input.value.trim();
    if (!val) { this.result.innerHTML = ''; return; }
    let char, codePoint;
    if (val.startsWith('U+') || val.startsWith('u+')) {
      codePoint = parseInt(val.slice(2), 16);
      char = String.fromCodePoint(codePoint);
    } else {
      char = val.charAt(0);
      codePoint = char.codePointAt(0);
    }
    const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
    const dec = codePoint.toString();
    const htmlEntity = `&#${dec};`;
    const cssEscape = `\\${hex}`;
    const jsEscape = codePoint > 0xFFFF ? `\\u{${hex}}` : `\\u${hex}`;
    this.result.innerHTML = `
      <div class="char-display">${char}</div>
      <div class="info-row"><span class="info-label">Unicode</span><span class="info-value">U+${hex}</span></div>
      <div class="info-row"><span class="info-label">Decimal</span><span class="info-value">${dec}</span></div>
      <div class="info-row"><span class="info-label">HTML</span><span class="info-value">${htmlEntity}</span></div>
      <div class="info-row"><span class="info-label">CSS</span><span class="info-value">${cssEscape}</span></div>
      <div class="info-row"><span class="info-label">JavaScript</span><span class="info-value">${jsEscape}</span></div>
    `;
  }
}
document.addEventListener('DOMContentLoaded', () => new UnicodeLookup());
