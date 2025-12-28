// JWT Decoder - Popup Script
class JWTDecoder {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.jwt = document.getElementById('jwt'); this.btn = document.getElementById('decode'); this.result = document.getElementById('result'); }
  bindEvents() { this.btn.addEventListener('click', () => this.decode()); }
  decode() {
    const token = this.jwt.value.trim();
    const parts = token.split('.');
    if (parts.length !== 3) { this.result.innerHTML = '<div class="section"><div class="section-content" style="color:#f87171">Invalid JWT format</div></div>'; return; }
    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g,'+').replace(/_/g,'/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
      let expiry = '';
      if (payload.exp) {
        const date = new Date(payload.exp * 1000);
        const isExpired = date < new Date();
        expiry = `<div class="section"><div class="section-title">Expiry</div><div class="section-content" style="color:${isExpired ? '#f87171' : '#4ade80'}">${date.toLocaleString()} (${isExpired ? 'EXPIRED' : 'Valid'})</div></div>`;
      }
      this.result.innerHTML = `
        <div class="section"><div class="section-title">Header</div><div class="section-content">${JSON.stringify(header, null, 2)}</div></div>
        <div class="section"><div class="section-title">Payload</div><div class="section-content">${JSON.stringify(payload, null, 2)}</div></div>
        ${expiry}
      `;
    } catch (e) { this.result.innerHTML = '<div class="section"><div class="section-content" style="color:#f87171">Error decoding: ' + e.message + '</div></div>'; }
  }
}
document.addEventListener('DOMContentLoaded', () => new JWTDecoder());
