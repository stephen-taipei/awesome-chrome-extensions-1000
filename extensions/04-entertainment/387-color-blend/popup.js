// Color Blend - Popup Script
class ColorBlend {
  constructor() {
    this.targetR = 0;
    this.targetG = 0;
    this.targetB = 0;
    this.score = 0;
    this.best = 0;
    this.init();
  }
  init() {
    chrome.storage.local.get(['colorBlendBest'], (r) => {
      this.best = r.colorBlendBest || 0;
      document.getElementById('best').textContent = this.best;
    });
    ['r', 'g', 'b'].forEach(c => {
      const slider = document.getElementById(c + 'Slider');
      slider.addEventListener('input', () => this.updateMix());
    });
    document.getElementById('checkBtn').addEventListener('click', () => this.check());
    this.newTarget();
  }
  newTarget() {
    this.targetR = Math.floor(Math.random() * 256);
    this.targetG = Math.floor(Math.random() * 256);
    this.targetB = Math.floor(Math.random() * 256);
    document.getElementById('target').style.background = `rgb(${this.targetR},${this.targetG},${this.targetB})`;
    document.getElementById('rSlider').value = 128;
    document.getElementById('gSlider').value = 128;
    document.getElementById('bSlider').value = 128;
    this.updateMix();
    document.getElementById('message').textContent = '';
  }
  updateMix() {
    const r = document.getElementById('rSlider').value;
    const g = document.getElementById('gSlider').value;
    const b = document.getElementById('bSlider').value;
    document.getElementById('rVal').textContent = r;
    document.getElementById('gVal').textContent = g;
    document.getElementById('bVal').textContent = b;
    document.getElementById('mix').style.background = `rgb(${r},${g},${b})`;
  }
  check() {
    const r = parseInt(document.getElementById('rSlider').value);
    const g = parseInt(document.getElementById('gSlider').value);
    const b = parseInt(document.getElementById('bSlider').value);
    const diff = Math.abs(r - this.targetR) + Math.abs(g - this.targetG) + Math.abs(b - this.targetB);
    const msg = document.getElementById('message');
    if (diff <= 30) {
      msg.textContent = '🎉 Perfect! +3 points';
      msg.className = 'message good';
      this.score += 3;
    } else if (diff <= 60) {
      msg.textContent = '👍 Great! +2 points';
      msg.className = 'message good';
      this.score += 2;
    } else if (diff <= 100) {
      msg.textContent = '😊 Close! +1 point';
      msg.className = 'message close';
      this.score += 1;
    } else {
      msg.textContent = '😅 Too far! Try again';
      msg.className = 'message far';
    }
    document.getElementById('score').textContent = this.score;
    if (this.score > this.best) {
      this.best = this.score;
      document.getElementById('best').textContent = this.best;
      chrome.storage.local.set({ colorBlendBest: this.best });
    }
    if (diff <= 100) {
      setTimeout(() => this.newTarget(), 1000);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new ColorBlend());
