// Font Previewer - Popup Script
class FontPreviewer {
  constructor() { this.fonts = ['Arial','Arial Black','Verdana','Tahoma','Trebuchet MS','Georgia','Times New Roman','Palatino Linotype','Courier New','Lucida Console','Monaco','Comic Sans MS','Impact','Helvetica','Garamond','Book Antiqua','Lucida Sans','system-ui','sans-serif','serif','monospace','cursive','fantasy']; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.previewText = document.getElementById('previewText'); this.fontSize = document.getElementById('fontSize'); this.sizeLabel = document.getElementById('sizeLabel'); this.fontList = document.getElementById('fontList'); }
  bindEvents() { this.previewText.addEventListener('input', () => this.render()); this.fontSize.addEventListener('input', () => { this.sizeLabel.textContent = this.fontSize.value + 'px'; this.render(); }); }
  render() { const text = this.previewText.value || 'The quick brown fox jumps'; const size = this.fontSize.value + 'px'; this.fontList.innerHTML = this.fonts.map(font => `<div class="font-item" onclick="navigator.clipboard.writeText('font-family: ${font};')"><div class="font-name">${font}</div><div class="font-preview" style="font-family: '${font}'; font-size: ${size}">${this.escapeHtml(text)}</div></div>`).join(''); }
  escapeHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
}
document.addEventListener('DOMContentLoaded', () => new FontPreviewer());
