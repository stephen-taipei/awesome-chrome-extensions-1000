// Dev Unit Converter - Popup Script
class UnitConverter {
  constructor() { this.tabs = { storage: [{unit:'Bytes',factor:1},{unit:'KB',factor:1024},{unit:'MB',factor:1024*1024},{unit:'GB',factor:1024*1024*1024},{unit:'TB',factor:1024*1024*1024*1024}], pixels: [{unit:'px',factor:1},{unit:'rem (16)',factor:16},{unit:'em (16)',factor:16},{unit:'pt',factor:1.333},{unit:'vw (1920)',factor:19.2}], time: [{unit:'ms',factor:1},{unit:'sec',factor:1000},{unit:'min',factor:60000},{unit:'hour',factor:3600000},{unit:'day',factor:86400000}] }; this.currentTab = 'storage'; this.initElements(); this.bindEvents(); this.render(); }
  initElements() { this.tabBtns = document.querySelectorAll('.tab'); this.converter = document.getElementById('converter'); }
  bindEvents() { this.tabBtns.forEach(btn => btn.addEventListener('click', () => { this.tabBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active'); this.currentTab = btn.dataset.tab; this.render(); })); }
  render() { const units = this.tabs[this.currentTab]; this.converter.innerHTML = units.map(u => `<div class="unit-row"><label>${u.unit}</label><input type="number" data-factor="${u.factor}" placeholder="0"></div>`).join(''); this.converter.querySelectorAll('input').forEach(input => { input.addEventListener('input', (e) => this.convert(e.target)); }); }
  convert(source) { const baseValue = parseFloat(source.value) * parseFloat(source.dataset.factor); if (isNaN(baseValue)) return; this.converter.querySelectorAll('input').forEach(input => { if (input !== source) { const factor = parseFloat(input.dataset.factor); input.value = (baseValue / factor).toFixed(6).replace(/\.?0+$/, ''); } }); }
}
document.addEventListener('DOMContentLoaded', () => new UnitConverter());
