// Color Picker - Popup Script

class ColorPicker {
  constructor() {
    this.savedColors = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.updateColor();
  }

  initElements() {
    this.colorPickerEl = document.getElementById('colorPicker');
    this.colorPreviewEl = document.getElementById('colorPreview');
    this.hexValueEl = document.getElementById('hexValue');
    this.rgbValueEl = document.getElementById('rgbValue');
    this.hslValueEl = document.getElementById('hslValue');
    this.saveColorBtn = document.getElementById('saveColor');
    this.savedColorsEl = document.getElementById('savedColors');
  }

  bindEvents() {
    this.colorPickerEl.addEventListener('input', () => this.updateColor());
    this.saveColorBtn.addEventListener('click', () => this.saveColor());

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => this.copyFormat(btn.dataset.format));
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('colorPickerColors');
    if (result.colorPickerColors) {
      this.savedColors = result.colorPickerColors;
    }
    this.renderSavedColors();
  }

  async saveData() {
    await chrome.storage.local.set({ colorPickerColors: this.savedColors });
  }

  updateColor() {
    const hex = this.colorPickerEl.value;
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    this.colorPreviewEl.style.backgroundColor = hex;
    this.hexValueEl.value = hex.toUpperCase();
    this.rgbValueEl.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    this.hslValueEl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  async copyFormat(format) {
    let value;
    switch (format) {
      case 'hex': value = this.hexValueEl.value; break;
      case 'rgb': value = this.rgbValueEl.value; break;
      case 'hsl': value = this.hslValueEl.value; break;
    }

    await navigator.clipboard.writeText(value);

    const btn = document.querySelector(`[data-format="${format}"]`);
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 1000);
  }

  saveColor() {
    const hex = this.colorPickerEl.value.toUpperCase();
    if (!this.savedColors.includes(hex)) {
      this.savedColors.unshift(hex);
      if (this.savedColors.length > 18) {
        this.savedColors.pop();
      }
      this.saveData();
      this.renderSavedColors();
    }
  }

  renderSavedColors() {
    if (this.savedColors.length === 0) {
      this.savedColorsEl.innerHTML = '<div class="empty-state">No saved colors yet</div>';
      return;
    }

    this.savedColorsEl.innerHTML = this.savedColors.map((color, index) => `
      <div class="saved-color" style="background-color: ${color}" data-color="${color}">
        <button class="delete" data-index="${index}">&times;</button>
      </div>
    `).join('');

    this.savedColorsEl.querySelectorAll('.saved-color').forEach(el => {
      el.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete')) {
          this.colorPickerEl.value = el.dataset.color;
          this.updateColor();
        }
      });
    });

    this.savedColorsEl.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteColor(parseInt(btn.dataset.index));
      });
    });
  }

  deleteColor(index) {
    this.savedColors.splice(index, 1);
    this.saveData();
    this.renderSavedColors();
  }
}

document.addEventListener('DOMContentLoaded', () => new ColorPicker());
