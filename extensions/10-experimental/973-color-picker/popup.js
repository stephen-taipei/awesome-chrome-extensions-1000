document.addEventListener('DOMContentLoaded', () => {
  const previewBox = document.getElementById('preview-box');
  const colorInput = document.getElementById('color-input');
  const hexInput = document.getElementById('hex-input');
  const historySwatches = document.getElementById('history-swatches');
  const paletteSwatches = document.getElementById('palette-swatches');

  let currentColor = '#3498db';

  // Update color display
  function updateColor(hex) {
    currentColor = hex;
    previewBox.style.background = hex;
    colorInput.value = hex;
    hexInput.value = hex;

    const rgb = hexToRgb(hex);
    const hsl = hexToHsl(hex);

    document.getElementById('hex-value').textContent = hex;
    document.getElementById('rgb-value').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('hsl-value').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  // Color input change
  colorInput.addEventListener('input', (e) => updateColor(e.target.value));
  hexInput.addEventListener('change', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      updateColor(e.target.value);
    }
  });

  // Eyedropper (if supported)
  document.getElementById('eyedropper-btn').addEventListener('click', async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        updateColor(result.sRGBHex);
        saveToHistory(result.sRGBHex);
      } catch (e) {
        console.log('Eyedropper cancelled');
      }
    } else {
      alert('EyeDropper API not supported in this browser');
    }
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      let value = '';
      if (format === 'hex') value = currentColor;
      else if (format === 'rgb') value = document.getElementById('rgb-value').textContent;
      else if (format === 'hsl') value = document.getElementById('hsl-value').textContent;

      navigator.clipboard.writeText(value);
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = '📋', 1000);
    });
  });

  // Add to palette
  document.getElementById('add-to-palette').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'ADD_TO_PALETTE',
      paletteId: 'default',
      color: currentColor
    }, () => loadPalette());
  });

  // Load history
  function loadHistory() {
    chrome.storage.local.get(['colorHistory'], (data) => {
      const history = data.colorHistory || [];
      historySwatches.innerHTML = history.slice(0, 10).map(c =>
        `<div class="swatch" style="background: ${c.hex};" data-color="${c.hex}"></div>`
      ).join('');

      historySwatches.querySelectorAll('.swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          updateColor(swatch.dataset.color);
          navigator.clipboard.writeText(swatch.dataset.color);
        });
      });
    });
  }

  // Load palette
  function loadPalette() {
    chrome.storage.local.get(['palettes'], (data) => {
      const palettes = data.palettes || [];
      const defaultPalette = palettes.find(p => p.id === 'default');
      if (defaultPalette) {
        paletteSwatches.innerHTML = defaultPalette.colors.map(c =>
          `<div class="swatch" style="background: ${c};" data-color="${c}"></div>`
        ).join('');
      }
    });
  }

  function saveToHistory(hex) {
    chrome.runtime.sendMessage({ type: 'SAVE_COLOR', color: hex }, () => loadHistory());
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    let { r, g, b } = rgb;
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  updateColor(currentColor);
  loadHistory();
  loadPalette();
});
