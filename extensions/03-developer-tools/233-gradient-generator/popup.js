// Gradient Generator - Popup Script
class GradientGenerator {
  constructor() { this.initElements(); this.bindEvents(); this.update(); }
  initElements() { this.preview = document.getElementById('preview'); this.gradientType = document.getElementById('gradientType'); this.angle = document.getElementById('angle'); this.angleLabel = document.getElementById('angleLabel'); this.color1 = document.getElementById('color1'); this.color2 = document.getElementById('color2'); this.cssOutput = document.getElementById('cssOutput'); this.copyBtn = document.getElementById('copyBtn'); }
  bindEvents() { [this.gradientType, this.angle, this.color1, this.color2].forEach(el => el.addEventListener('input', () => this.update())); this.copyBtn.addEventListener('click', () => this.copy()); }
  update() { const type = this.gradientType.value; const deg = this.angle.value; const c1 = this.color1.value; const c2 = this.color2.value; this.angleLabel.textContent = deg + '°'; let gradient; if (type === 'linear') { gradient = `linear-gradient(${deg}deg, ${c1} 0%, ${c2} 100%)`; } else { gradient = `radial-gradient(circle, ${c1} 0%, ${c2} 100%)`; } this.preview.style.background = gradient; this.cssOutput.value = `background: ${gradient};`; }
  async copy() { await navigator.clipboard.writeText(this.cssOutput.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy CSS'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new GradientGenerator());
