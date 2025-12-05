document.addEventListener('DOMContentLoaded', () => {
  const sourceLang = document.getElementById('source-lang');
  const targetLang = document.getElementById('target-lang');
  const inputText = document.getElementById('input-text');
  const resultBox = document.getElementById('result-box');
  const detectedLang = document.getElementById('detected-lang');
  const swapBtn = document.getElementById('swap-btn');

  // Load settings
  chrome.storage.local.get(['targetLanguage', 'sourceLanguage', 'translationEngine', 'learningMode'], (data) => {
    targetLang.value = data.targetLanguage || 'en';
    sourceLang.value = data.sourceLanguage || 'auto';
    document.getElementById('translation-engine').value = data.translationEngine || 'google';
    document.getElementById('learning-mode').checked = data.learningMode || false;
  });

  // Swap languages
  swapBtn.addEventListener('click', () => {
    if (sourceLang.value !== 'auto') {
      const temp = sourceLang.value;
      sourceLang.value = targetLang.value;
      targetLang.value = temp;
      swapBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => swapBtn.style.transform = '', 300);
    }
  });

  // Translate text
  document.getElementById('translate-text').addEventListener('click', () => {
    const text = inputText.value.trim();
    if (!text) return;

    resultBox.textContent = 'Translating...';
    resultBox.classList.add('loading');

    // Simulate translation
    setTimeout(() => {
      const mockTranslation = translateMock(text, targetLang.value);
      resultBox.textContent = mockTranslation;
      resultBox.classList.remove('loading');

      // Detect language
      detectLanguage(text);
    }, 500);
  });

  // Translate page
  document.getElementById('translate-page').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TRANSLATE_PAGE',
        targetLang: targetLang.value
      });
      window.close();
    });
  });

  // Auto-detect on input
  inputText.addEventListener('input', () => {
    if (inputText.value.length > 5) {
      detectLanguage(inputText.value);
    }
  });

  function detectLanguage(text) {
    const langMap = {
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      en: 'English'
    };

    let detected = 'en';
    if (/[\u4e00-\u9fff]/.test(text)) detected = 'zh';
    else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) detected = 'ja';
    else if (/[\uac00-\ud7af]/.test(text)) detected = 'ko';

    detectedLang.textContent = langMap[detected];
  }

  function translateMock(text, target) {
    // Simple mock translations
    const translations = {
      'hello': { zh: '你好', ja: 'こんにちは', ko: '안녕하세요', es: 'hola', fr: 'bonjour', de: 'hallo' },
      'world': { zh: '世界', ja: '世界', ko: '세계', es: 'mundo', fr: 'monde', de: 'welt' },
      'thank you': { zh: '谢谢', ja: 'ありがとう', ko: '감사합니다', es: 'gracias', fr: 'merci', de: 'danke' }
    };

    const lower = text.toLowerCase();
    if (translations[lower] && translations[lower][target]) {
      return translations[lower][target];
    }
    return `[${target.toUpperCase()}] ${text}`;
  }

  // Save settings
  targetLang.addEventListener('change', () => {
    chrome.storage.local.set({ targetLanguage: targetLang.value });
  });

  sourceLang.addEventListener('change', () => {
    chrome.storage.local.set({ sourceLanguage: sourceLang.value });
  });

  document.getElementById('translation-engine').addEventListener('change', (e) => {
    chrome.storage.local.set({ translationEngine: e.target.value });
  });

  document.getElementById('learning-mode').addEventListener('change', (e) => {
    chrome.storage.local.set({ learningMode: e.target.checked });
  });
});
