document.addEventListener('DOMContentLoaded', () => {
  const enableFocusBtn = document.getElementById('enableFocusBtn');
  const textWidth = document.getElementById('textWidth');
  const fontSize = document.getElementById('fontSize');
  const lineHeight = document.getElementById('lineHeight');
  const textWidthValue = document.getElementById('textWidthValue');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const lineHeightValue = document.getElementById('lineHeightValue');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const hideImages = document.getElementById('hideImages');
  const hideSidebars = document.getElementById('hideSidebars');
  const hideAds = document.getElementById('hideAds');
  const hideComments = document.getElementById('hideComments');

  let focusEnabled = false;
  let settings = {
    textWidth: 650,
    fontSize: 18,
    lineHeight: 1.6,
    theme: 'dark',
    hideImages: true,
    hideSidebars: true,
    hideAds: true,
    hideComments: true
  };

  chrome.storage.local.get(['focusSettings'], (result) => {
    if (result.focusSettings) {
      settings = { ...settings, ...result.focusSettings };
      applySettingsToUI();
    }
  });

  function applySettingsToUI() {
    textWidth.value = settings.textWidth;
    textWidthValue.textContent = settings.textWidth;
    fontSize.value = settings.fontSize;
    fontSizeValue.textContent = settings.fontSize;
    lineHeight.value = settings.lineHeight;
    lineHeightValue.textContent = settings.lineHeight;
    hideImages.checked = settings.hideImages;
    hideSidebars.checked = settings.hideSidebars;
    hideAds.checked = settings.hideAds;
    hideComments.checked = settings.hideComments;

    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === settings.theme);
    });
  }

  enableFocusBtn.addEventListener('click', async () => {
    focusEnabled = !focusEnabled;
    enableFocusBtn.textContent = focusEnabled ? 'Disable Focus Mode' : 'Enable Focus Mode';
    enableFocusBtn.classList.toggle('active', focusEnabled);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: applyFocusMode,
      args: [focusEnabled, settings]
    });
  });

  [textWidth, fontSize, lineHeight].forEach(input => {
    input.addEventListener('input', () => {
      settings.textWidth = parseInt(textWidth.value);
      settings.fontSize = parseInt(fontSize.value);
      settings.lineHeight = parseFloat(lineHeight.value);
      textWidthValue.textContent = settings.textWidth;
      fontSizeValue.textContent = settings.fontSize;
      lineHeightValue.textContent = settings.lineHeight;
      saveSettings();
    });
  });

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      settings.theme = btn.dataset.theme;
      saveSettings();
    });
  });

  [hideImages, hideSidebars, hideAds, hideComments].forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      settings.hideImages = hideImages.checked;
      settings.hideSidebars = hideSidebars.checked;
      settings.hideAds = hideAds.checked;
      settings.hideComments = hideComments.checked;
      saveSettings();
    });
  });

  function saveSettings() {
    chrome.storage.local.set({ focusSettings: settings });
  }

  function applyFocusMode(enabled, settings) {
    const existingStyle = document.getElementById('focus-reader-style');
    if (existingStyle) existingStyle.remove();

    if (!enabled) return;

    const themes = {
      dark: { bg: '#1a1a2e', text: '#e0e0e0' },
      light: { bg: '#ffffff', text: '#333333' },
      sepia: { bg: '#f4ecd8', text: '#5c4b37' }
    };

    const theme = themes[settings.theme];

    const style = document.createElement('style');
    style.id = 'focus-reader-style';
    style.textContent = `
      body {
        background: ${theme.bg} !important;
        color: ${theme.text} !important;
      }
      article, main, .content, .post, .entry-content, [role="main"] {
        max-width: ${settings.textWidth}px !important;
        margin: 0 auto !important;
        padding: 40px 20px !important;
        font-size: ${settings.fontSize}px !important;
        line-height: ${settings.lineHeight} !important;
        background: ${theme.bg} !important;
        color: ${theme.text} !important;
      }
      ${settings.hideImages ? 'img, figure, picture, video { display: none !important; }' : ''}
      ${settings.hideSidebars ? 'aside, sidebar, .sidebar, [role="complementary"] { display: none !important; }' : ''}
      ${settings.hideAds ? '.ad, .ads, .advertisement, [class*="ad-"], [id*="ad-"] { display: none !important; }' : ''}
      ${settings.hideComments ? '.comments, #comments, .comment-section { display: none !important; }' : ''}
      header, footer, nav { opacity: 0.3 !important; }
    `;

    document.head.appendChild(style);
  }
});
