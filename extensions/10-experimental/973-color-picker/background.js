// Background service worker for Color Picker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Color Picker installed.');

  chrome.storage.local.set({
    colorHistory: [],
    palettes: [{ id: 'default', name: 'My Palette', colors: [] }],
    defaultFormat: 'hex'
  });
});

// Handle color operations
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_COLOR') {
    chrome.storage.local.get(['colorHistory'], (data) => {
      const history = data.colorHistory || [];
      const newColor = {
        id: Date.now(),
        hex: message.color,
        rgb: hexToRgb(message.color),
        hsl: hexToHsl(message.color),
        timestamp: new Date().toISOString()
      };
      history.unshift(newColor);
      if (history.length > 50) history.pop();
      chrome.storage.local.set({ colorHistory: history });
      sendResponse({ success: true, color: newColor });
    });
    return true;
  }

  if (message.type === 'ADD_TO_PALETTE') {
    chrome.storage.local.get(['palettes'], (data) => {
      const palettes = data.palettes || [];
      const palette = palettes.find(p => p.id === message.paletteId);
      if (palette) {
        palette.colors.push(message.color);
        chrome.storage.local.set({ palettes });
        sendResponse({ success: true });
      }
    });
    return true;
  }
});

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let { r, g, b } = rgb;
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
