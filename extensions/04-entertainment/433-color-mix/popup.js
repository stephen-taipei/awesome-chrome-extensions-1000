// Color Mix - Popup Script
class ColorMix {
  constructor() {
    this.target = { r: 0, g: 0, b: 0 };
    this.score = 0;
    this.level = 1;
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorMixScore', 'colorMixLevel'], (r) => {
      this.score = r.colorMixScore || 0;
      this.level = r.colorMixLevel || 1;
      this.updateStats();
    });
    ['red', 'green', 'blue'].forEach(c => {
      document.getElementById(c).addEventListener('input', () => this.updateMix());
    });
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
    this.newTarget();
  }
  newTarget() {
    this.target = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
    document.getElementById('target').style.background = `rgb(${this.target.r},${this.target.g},${this.target.b})`;
    document.getElementById('red').value = 128;
    document.getElementById('green').value = 128;
    document.getElementById('blue').value = 128;
    this.updateMix();
  }
  updateMix() {
    const r = document.getElementById('red').value;
    const g = document.getElementById('green').value;
    const b = document.getElementById('blue').value;
    document.getElementById('redVal').textContent = r;
    document.getElementById('greenVal').textContent = g;
    document.getElementById('blueVal').textContent = b;
    document.getElementById('mix').style.background = `rgb(${r},${g},${b})`;
  }
  check() {
    const r = parseInt(document.getElementById('red').value);
    const g = parseInt(document.getElementById('green').value);
    const b = parseInt(document.getElementById('blue').value);
    const diff = Math.abs(r - this.target.r) + Math.abs(g - this.target.g) + Math.abs(b - this.target.b);
    const tolerance = Math.max(60 - this.level * 5, 15);
    if (diff <= tolerance) {
      const points = Math.max(100 - diff, 10);
      this.score += points;
      this.level = Math.min(this.level + 1, 10);
      chrome.storage.local.set({ colorMixScore: this.score, colorMixLevel: this.level });
      alert(`Match! +${points} points`);
      this.newTarget();
    } else {
      alert(`Not quite! Off by ${diff} (need within ${tolerance})`);
    }
    this.updateStats();
  }
  updateStats() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorMix());
