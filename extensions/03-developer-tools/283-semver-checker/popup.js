// SemVer Checker - Popup Script
class SemVerChecker {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.v1 = document.getElementById('v1'); this.v2 = document.getElementById('v2'); this.op = document.getElementById('op'); this.compareBtn = document.getElementById('compare'); this.result = document.getElementById('result'); this.version = document.getElementById('version'); this.bumped = document.getElementById('bumped'); this.bumpBtns = document.querySelectorAll('.bump'); }
  bindEvents() { this.compareBtn.addEventListener('click', () => this.compare()); this.bumpBtns.forEach(btn => btn.addEventListener('click', () => this.bump(btn.dataset.type))); }
  parseVersion(v) { const parts = v.split('.').map(Number); return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 }; }
  compare() {
    const a = this.parseVersion(this.v1.value);
    const b = this.parseVersion(this.v2.value);
    const op = this.op.value;
    const cmp = this.compareVersions(a, b);
    let result = false;
    switch(op) {
      case '>': result = cmp > 0; break;
      case '>=': result = cmp >= 0; break;
      case '<': result = cmp < 0; break;
      case '<=': result = cmp <= 0; break;
      case '=': result = cmp === 0; break;
    }
    this.result.textContent = `${this.v1.value} ${op} ${this.v2.value} is ${result ? 'TRUE' : 'FALSE'}`;
    this.result.style.color = result ? '#4ade80' : '#f87171';
  }
  compareVersions(a, b) {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }
  bump(type) {
    const v = this.parseVersion(this.version.value);
    if (type === 'major') { v.major++; v.minor = 0; v.patch = 0; }
    else if (type === 'minor') { v.minor++; v.patch = 0; }
    else { v.patch++; }
    this.bumped.textContent = `${v.major}.${v.minor}.${v.patch}`;
  }
}
document.addEventListener('DOMContentLoaded', () => new SemVerChecker());
