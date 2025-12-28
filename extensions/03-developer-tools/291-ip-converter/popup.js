// IP Converter - Popup Script
class IPConverter {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('ip'); this.btn = document.getElementById('convert'); this.result = document.getElementById('result'); }
  bindEvents() { this.btn.addEventListener('click', () => this.convert()); this.input.addEventListener('keypress', e => { if (e.key === 'Enter') this.convert(); }); }
  convert() {
    const ip = this.input.value.trim();
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      this.result.innerHTML = '<div style="color:#f87171">Invalid IPv4 address</div>'; return;
    }
    const decimal = ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
    const hex = parts.map(p => p.toString(16).padStart(2, '0').toUpperCase()).join('.');
    const binary = parts.map(p => p.toString(2).padStart(8, '0')).join('.');
    const octal = parts.map(p => p.toString(8)).join('.');
    this.result.innerHTML = `
      <div class="result-row"><span class="result-label">Decimal</span><span class="result-value" onclick="navigator.clipboard.writeText('${decimal}')">${decimal}</span></div>
      <div class="result-row"><span class="result-label">Hexadecimal</span><span class="result-value" onclick="navigator.clipboard.writeText('${hex}')">${hex}</span></div>
      <div class="result-row"><span class="result-label">Binary</span><span class="result-value" onclick="navigator.clipboard.writeText('${binary}')">${binary}</span></div>
      <div class="result-row"><span class="result-label">Octal</span><span class="result-value" onclick="navigator.clipboard.writeText('${octal}')">${octal}</span></div>
    `;
  }
}
document.addEventListener('DOMContentLoaded', () => new IPConverter());
