// Hash Identifier - Popup Script
class HashIdentifier {
  constructor() {
    this.hashes = [
      { name: 'MD5', len: 32, pattern: /^[a-f0-9]{32}$/i },
      { name: 'SHA-1', len: 40, pattern: /^[a-f0-9]{40}$/i },
      { name: 'SHA-224', len: 56, pattern: /^[a-f0-9]{56}$/i },
      { name: 'SHA-256', len: 64, pattern: /^[a-f0-9]{64}$/i },
      { name: 'SHA-384', len: 96, pattern: /^[a-f0-9]{96}$/i },
      { name: 'SHA-512', len: 128, pattern: /^[a-f0-9]{128}$/i },
      { name: 'CRC32', len: 8, pattern: /^[a-f0-9]{8}$/i },
      { name: 'NTLM', len: 32, pattern: /^[a-f0-9]{32}$/i },
      { name: 'bcrypt', len: 60, pattern: /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/ },
      { name: 'Base64', len: -1, pattern: /^[A-Za-z0-9+/]+=*$/ }
    ];
    this.initElements(); this.bindEvents();
  }
  initElements() { this.hashInput = document.getElementById('hash'); this.identifyBtn = document.getElementById('identify'); this.result = document.getElementById('result'); }
  bindEvents() { this.identifyBtn.addEventListener('click', () => this.identify()); }
  identify() {
    const hash = this.hashInput.value.trim();
    if (!hash) { this.result.innerHTML = '<div style="color:#9ca3af">Please enter a hash</div>'; return; }
    const matches = this.hashes.filter(h => h.pattern.test(hash));
    if (matches.length === 0) { this.result.innerHTML = '<div style="color:#f87171">Unknown hash type</div>'; return; }
    this.result.innerHTML = `
      <div style="color:#9ca3af;margin-bottom:8px;font-size:10px">Length: ${hash.length} characters</div>
      ${matches.map(m => `<div class="match"><span class="match-name">${m.name}</span><span class="match-len"> (${m.len > 0 ? m.len + ' chars' : 'variable'})</span></div>`).join('')}
    `;
  }
}
document.addEventListener('DOMContentLoaded', () => new HashIdentifier());
