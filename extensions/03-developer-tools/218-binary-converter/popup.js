// Binary Converter - Popup Script
class BinaryConverter {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.decEl = document.getElementById('decimal'); this.binEl = document.getElementById('binary'); this.octEl = document.getElementById('octal'); this.hexEl = document.getElementById('hex'); this.clearBtn = document.getElementById('clearBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.decEl.addEventListener('input', () => this.convertFrom('dec')); this.binEl.addEventListener('input', () => this.convertFrom('bin')); this.octEl.addEventListener('input', () => this.convertFrom('oct')); this.hexEl.addEventListener('input', () => this.convertFrom('hex')); this.clearBtn.addEventListener('click', () => this.clear()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  convertFrom(base) { let value; try { switch(base) { case 'dec': value = parseInt(this.decEl.value, 10); break; case 'bin': value = parseInt(this.binEl.value, 2); break; case 'oct': value = parseInt(this.octEl.value, 8); break; case 'hex': value = parseInt(this.hexEl.value, 16); break; } if (isNaN(value)) { this.setStatus('Invalid input', 'error'); return; } if (base !== 'dec') this.decEl.value = value.toString(10); if (base !== 'bin') this.binEl.value = value.toString(2); if (base !== 'oct') this.octEl.value = value.toString(8); if (base !== 'hex') this.hexEl.value = value.toString(16).toUpperCase(); this.setStatus('Converted!', 'success'); } catch (e) { this.setStatus('Error: ' + e.message, 'error'); } }
  clear() { this.decEl.value = ''; this.binEl.value = ''; this.octEl.value = ''; this.hexEl.value = ''; this.statusEl.textContent = ''; }
}
document.addEventListener('DOMContentLoaded', () => new BinaryConverter());
