// Background service worker for Page Translator
chrome.runtime.onInstalled.addListener(() => {
  console.log('Page Translator installed.');

  chrome.storage.local.set({
    targetLanguage: 'en',
    sourceLanguage: 'auto',
    translationEngine: 'google',
    learningMode: false,
    translationHistory: []
  });

  // Create context menu
  chrome.contextMenus.create({
    id: 'translateSelection',
    title: 'Translate Selection',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'translatePage',
    title: 'Translate Page',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translateSelection') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'TRANSLATE_SELECTION',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'translatePage') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'TRANSLATE_PAGE'
    });
  }
});

// Handle translation requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRANSLATE_TEXT') {
    translateText(message.text, message.targetLang).then(result => {
      sendResponse({ success: true, translation: result });
    });
    return true;
  }

  if (message.type === 'DETECT_LANGUAGE') {
    detectLanguage(message.text).then(lang => {
      sendResponse({ success: true, language: lang });
    });
    return true;
  }
});

async function translateText(text, targetLang) {
  // Simulated translation - in production would call actual API
  const mockTranslations = {
    'hello': { 'zh': '你好', 'ja': 'こんにちは', 'es': 'hola' },
    'world': { 'zh': '世界', 'ja': '世界', 'es': 'mundo' }
  };

  return mockTranslations[text.toLowerCase()]?.[targetLang] || `[Translated: ${text}]`;
}

async function detectLanguage(text) {
  // Simple detection based on character ranges
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  return 'en';
}
