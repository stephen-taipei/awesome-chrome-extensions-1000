document.addEventListener('DOMContentLoaded', () => {
  const activateBtn = document.getElementById('activate-btn');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const fontSelect = document.getElementById('font-select');
  const fontSizeEl = document.getElementById('font-size');
  let fontSize = 18;

  // Activate reading mode
  activateBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'ENABLE_READING_MODE' });
      activateBtn.textContent = 'Reading Mode Active';
      activateBtn.classList.add('active');
    });
  });

  // Theme selection
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chrome.storage.local.set({ theme: btn.dataset.theme });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_THEME',
          theme: btn.dataset.theme
        });
      });
    });
  });

  // Font selection
  fontSelect.addEventListener('change', () => {
    chrome.storage.local.set({ fontFamily: fontSelect.value });
  });

  // Font size controls
  document.getElementById('decrease-size').addEventListener('click', () => {
    if (fontSize > 12) {
      fontSize -= 2;
      fontSizeEl.textContent = `${fontSize}px`;
      chrome.storage.local.set({ fontSize });
    }
  });

  document.getElementById('increase-size').addEventListener('click', () => {
    if (fontSize < 28) {
      fontSize += 2;
      fontSizeEl.textContent = `${fontSize}px`;
      chrome.storage.local.set({ fontSize });
    }
  });

  // Line height
  document.getElementById('line-height').addEventListener('input', (e) => {
    chrome.storage.local.set({ lineHeight: parseFloat(e.target.value) });
  });

  // Text to speech
  document.getElementById('play-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_TEXT' }, (response) => {
        if (response && response.text) {
          chrome.runtime.sendMessage({
            type: 'READ_ALOUD',
            text: response.text,
            rate: parseFloat(document.getElementById('speed-slider').value)
          });
        }
      });
    });
  });

  document.getElementById('stop-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_READING' });
  });

  // Load settings
  chrome.storage.local.get(['theme', 'fontSize', 'fontFamily', 'lineHeight'], (data) => {
    if (data.theme) {
      themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === data.theme);
      });
    }
    if (data.fontSize) {
      fontSize = data.fontSize;
      fontSizeEl.textContent = `${fontSize}px`;
    }
    if (data.fontFamily) fontSelect.value = data.fontFamily;
    if (data.lineHeight) document.getElementById('line-height').value = data.lineHeight;
  });
});
