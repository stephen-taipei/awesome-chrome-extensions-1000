document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const moonIcon = document.getElementById('moonIcon');
  const statusText = document.getElementById('statusText');
  const brightnessSlider = document.getElementById('brightness');
  const contrastSlider = document.getElementById('contrast');
  const sepiaSlider = document.getElementById('sepia');
  const brightnessValue = document.getElementById('brightnessValue');
  const contrastValue = document.getElementById('contrastValue');
  const sepiaValue = document.getElementById('sepiaValue');
  const presetBtns = document.querySelectorAll('.preset-btn');

  const presets = {
    dark: { brightness: 80, contrast: 100, sepia: 0 },
    dim: { brightness: 90, contrast: 95, sepia: 10 },
    sepia: { brightness: 95, contrast: 100, sepia: 40 }
  };

  let settings = {
    enabled: false,
    brightness: 90,
    contrast: 100,
    sepia: 10
  };

  // Load settings
  chrome.storage.local.get(['darkModeSettings'], (result) => {
    if (result.darkModeSettings) {
      settings = result.darkModeSettings;
      updateUI();
    }
  });

  function updateUI() {
    darkModeToggle.checked = settings.enabled;
    moonIcon.classList.toggle('active', settings.enabled);
    statusText.textContent = settings.enabled ? 'On' : 'Off';

    brightnessSlider.value = settings.brightness;
    contrastSlider.value = settings.contrast;
    sepiaSlider.value = settings.sepia;

    brightnessValue.textContent = settings.brightness + '%';
    contrastValue.textContent = settings.contrast + '%';
    sepiaValue.textContent = settings.sepia + '%';
  }

  function applyDarkMode() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: injectDarkMode,
        args: [settings]
      });
    });

    chrome.storage.local.set({ darkModeSettings: settings });
  }

  function injectDarkMode(settings) {
    const styleId = 'dark-mode-extension-style';
    let style = document.getElementById(styleId);

    if (!settings.enabled) {
      if (style) style.remove();
      return;
    }

    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      html {
        filter: invert(1) hue-rotate(180deg) brightness(${settings.brightness / 100}) contrast(${settings.contrast / 100}) sepia(${settings.sepia / 100}) !important;
      }
      img, video, picture, canvas, [style*="background-image"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
    `;
  }

  // Event listeners
  darkModeToggle.addEventListener('change', () => {
    settings.enabled = darkModeToggle.checked;
    updateUI();
    applyDarkMode();
  });

  brightnessSlider.addEventListener('input', () => {
    settings.brightness = parseInt(brightnessSlider.value);
    brightnessValue.textContent = settings.brightness + '%';
    if (settings.enabled) applyDarkMode();
  });

  contrastSlider.addEventListener('input', () => {
    settings.contrast = parseInt(contrastSlider.value);
    contrastValue.textContent = settings.contrast + '%';
    if (settings.enabled) applyDarkMode();
  });

  sepiaSlider.addEventListener('input', () => {
    settings.sepia = parseInt(sepiaSlider.value);
    sepiaValue.textContent = settings.sepia + '%';
    if (settings.enabled) applyDarkMode();
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = presets[btn.dataset.preset];
      settings = { ...settings, ...preset, enabled: true };
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateUI();
      applyDarkMode();
    });
  });
});
