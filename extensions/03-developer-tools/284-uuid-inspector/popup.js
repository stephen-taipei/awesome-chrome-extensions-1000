// UUID Inspector - Popup Script
class UUIDInspector {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.uuidInput = document.getElementById('uuid'); this.analyzeBtn = document.getElementById('analyze'); this.generateBtn = document.getElementById('generate'); this.result = document.getElementById('result'); }
  bindEvents() { this.analyzeBtn.addEventListener('click', () => this.analyze()); this.generateBtn.addEventListener('click', () => this.generate()); }
  analyze() {
    const uuid = this.uuidInput.value.trim().toLowerCase();
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (!pattern.test(uuid)) { this.result.innerHTML = '<div style="color:#f87171">Invalid UUID format</div>'; return; }
    const version = parseInt(uuid.charAt(14), 16);
    const variant = parseInt(uuid.charAt(19), 16);
    let variantStr = 'Unknown';
    if ((variant & 0x8) === 0) variantStr = 'NCS backward compatible';
    else if ((variant & 0xC) === 0x8) variantStr = 'RFC 4122';
    else if ((variant & 0xE) === 0xC) variantStr = 'Microsoft backward compatible';
    else if ((variant & 0xE) === 0xE) variantStr = 'Reserved for future';
    this.result.innerHTML = `
      <div class="result-row"><span class="result-label">UUID:</span><span class="result-value">${uuid}</span></div>
      <div class="result-row"><span class="result-label">Version:</span><span class="result-value">${version} (${this.getVersionName(version)})</span></div>
      <div class="result-row"><span class="result-label">Variant:</span><span class="result-value">${variantStr}</span></div>
      <div class="result-row"><span class="result-label">Bytes:</span><span class="result-value">16</span></div>
      <div class="result-row"><span class="result-label">Bits:</span><span class="result-value">128</span></div>
    `;
  }
  getVersionName(v) { const names = ['','Time-based','DCE Security','MD5 hash','Random','SHA-1 hash']; return names[v] || 'Unknown'; }
  generate() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    this.uuidInput.value = uuid;
    navigator.clipboard.writeText(uuid);
    this.result.innerHTML = '<div style="color:#4ade80">Generated and copied!</div>';
  }
}
document.addEventListener('DOMContentLoaded', () => new UUIDInspector());
