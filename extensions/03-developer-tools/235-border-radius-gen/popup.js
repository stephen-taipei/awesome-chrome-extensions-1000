// Border Radius Generator - Popup Script
class BorderRadiusGenerator {
  constructor() { this.initElements(); this.bindEvents(); this.update(); }
  initElements() { this.preview = document.getElementById('preview'); this.tl = document.getElementById('tl'); this.tr = document.getElementById('tr'); this.br = document.getElementById('br'); this.bl = document.getElementById('bl'); this.linkAll = document.getElementById('linkAll'); this.cssOutput = document.getElementById('cssOutput'); this.copyBtn = document.getElementById('copyBtn'); this.labels = { tl: document.getElementById('tlLabel'), tr: document.getElementById('trLabel'), br: document.getElementById('brLabel'), bl: document.getElementById('blLabel') }; this.sliders = [this.tl, this.tr, this.br, this.bl]; }
  bindEvents() { this.sliders.forEach(slider => { slider.addEventListener('input', (e) => { if (this.linkAll.checked) { const val = e.target.value; this.sliders.forEach(s => s.value = val); } this.update(); }); }); this.copyBtn.addEventListener('click', () => this.copy()); }
  update() { const vals = { tl: this.tl.value, tr: this.tr.value, br: this.br.value, bl: this.bl.value }; Object.keys(vals).forEach(k => this.labels[k].textContent = vals[k] + 'px'); const radius = `${vals.tl}px ${vals.tr}px ${vals.br}px ${vals.bl}px`; this.preview.style.borderRadius = radius; this.cssOutput.value = `border-radius: ${radius};`; }
  async copy() { await navigator.clipboard.writeText(this.cssOutput.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy CSS'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new BorderRadiusGenerator());
