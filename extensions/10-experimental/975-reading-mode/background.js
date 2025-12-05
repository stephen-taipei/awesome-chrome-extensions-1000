// Background service worker for Reading Mode
chrome.runtime.onInstalled.addListener(() => {
  console.log('Reading Mode installed.');

  chrome.storage.local.set({
    theme: 'light',
    fontSize: 18,
    fontFamily: 'Georgia',
    lineHeight: 1.8,
    maxWidth: 700,
    savedArticles: []
  });
});

// Handle reading mode requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_ARTICLE') {
    chrome.storage.local.get(['savedArticles'], (data) => {
      const articles = data.savedArticles || [];
      articles.unshift({
        id: Date.now(),
        url: message.url,
        title: message.title,
        content: message.content,
        savedAt: new Date().toISOString()
      });
      if (articles.length > 50) articles.pop();
      chrome.storage.local.set({ savedArticles: articles });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'READ_ALOUD') {
    chrome.tts.speak(message.text, {
      rate: message.rate || 1.0,
      pitch: 1.0,
      onEvent: (event) => {
        if (event.type === 'end') {
          sendResponse({ success: true, completed: true });
        }
      }
    });
    return true;
  }

  if (message.type === 'STOP_READING') {
    chrome.tts.stop();
    sendResponse({ success: true });
  }
});
