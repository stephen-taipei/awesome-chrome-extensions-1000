// Number Base Converter - Popup Script
class BaseConverter {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.dec = document.getElementById('dec'); this.hex = document.getElementById('hex'); this.bin = document.getElementById('bin'); this.oct = document.getElementById('oct'); this.clearBtn = document.getElementById('clearBtn'); }
  bindEvents() { this.dec.addEventListener('input', () => this.fromDec()); this.hex.addEventListener('input', () => this.fromHex()); this.bin.addEventListener('input', () => this.fromBin()); this.oct.addEventListener('input', () => this.fromOct()); this.clearBtn.addEventListener('click', () => this.clear()); }
  updateAll(num, skip) { if (isNaN(num) || num < 0) return; if (skip !== 'dec') this.dec.value = num.toString(10); if (skip !== 'hex') this.hex.value = num.toString(16).toUpperCase(); if (skip !== 'bin') this.bin.value = num.toString(2); if (skip !== 'oct') this.oct.value = num.toString(8); }
  fromDec() { const val = this.dec.value.trim(); if (!val) return this.clear(); const num = parseInt(val, 10); this.updateAll(num, 'dec'); }
  fromHex() { const val = this.hex.value.trim(); if (!val) return this.clear(); const num = parseInt(val, 16); this.updateAll(num, 'hex'); }
  fromBin() { const val = this.bin.value.trim(); if (!val) return this.clear(); const num = parseInt(val, 2); this.updateAll(num, 'bin'); }
  fromOct() { const val = this.oct.value.trim(); if (!val) return this.clear(); const num = parseInt(val, 8); this.updateAll(num, 'oct'); }
  clear() { this.dec.value = ''; this.hex.value = ''; this.bin.value = ''; this.oct.value = ''; }
}
document.addEventListener('DOMContentLoaded', () => new BaseConverter());
