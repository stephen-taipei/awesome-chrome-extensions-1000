// CIDR Calculator - Popup Script
class CIDRCalculator {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('cidr'); this.btn = document.getElementById('calc'); this.result = document.getElementById('result'); }
  bindEvents() { this.btn.addEventListener('click', () => this.calc()); this.input.addEventListener('keypress', e => { if (e.key === 'Enter') this.calc(); }); }
  calc() {
    const [ip, prefix] = this.input.value.trim().split('/');
    const parts = ip.split('.').map(Number);
    const cidr = parseInt(prefix);
    if (parts.length !== 4 || isNaN(cidr) || cidr < 0 || cidr > 32) {
      this.result.innerHTML = '<div style="color:#f87171">Invalid CIDR notation</div>'; return;
    }
    const ipNum = ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const hosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;
    const toIP = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    this.result.innerHTML = `
      <div class="result-row"><span class="result-label">Network</span><span class="result-value">${toIP(network)}</span></div>
      <div class="result-row"><span class="result-label">Broadcast</span><span class="result-value">${toIP(broadcast)}</span></div>
      <div class="result-row"><span class="result-label">Subnet Mask</span><span class="result-value">${toIP(mask)}</span></div>
      <div class="result-row"><span class="result-label">Usable Hosts</span><span class="result-value">${hosts.toLocaleString()}</span></div>
      <div class="result-row"><span class="result-label">First Host</span><span class="result-value">${toIP(network + 1)}</span></div>
      <div class="result-row"><span class="result-label">Last Host</span><span class="result-value">${toIP(broadcast - 1)}</span></div>
    `;
  }
}
document.addEventListener('DOMContentLoaded', () => new CIDRCalculator());
