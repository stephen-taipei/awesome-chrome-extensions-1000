// Background service worker for Smart Clipboard
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Clipboard installed.');

  chrome.storage.local.set({
    clipboardHistory: [],
    snippets: [],
    maxHistorySize: 100,
    autoFormat: true
  });
});

// Listen for clipboard changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ADD_TO_HISTORY') {
    chrome.storage.local.get(['clipboardHistory', 'maxHistorySize'], (data) => {
      const history = data.clipboardHistory || [];
      const maxSize = data.maxHistorySize || 100;

      const newEntry = {
        id: Date.now(),
        content: message.content,
        type: detectContentType(message.content),
        timestamp: new Date().toISOString(),
        source: message.source || 'unknown'
      };

      history.unshift(newEntry);
      if (history.length > maxSize) history.pop();

      chrome.storage.local.set({ clipboardHistory: history });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'SAVE_SNIPPET') {
    chrome.storage.local.get(['snippets'], (data) => {
      const snippets = data.snippets || [];
      snippets.push({
        id: Date.now(),
        name: message.name,
        content: message.content,
        category: message.category || 'general'
      });
      chrome.storage.local.set({ snippets });
      sendResponse({ success: true });
    });
    return true;
  }
});

function detectContentType(content) {
  if (!content) return 'text';
  if (content.match(/^https?:\/\//)) return 'url';
  if (content.match(/^[\w.-]+@[\w.-]+\.\w+$/)) return 'email';
  if (content.match(/^\d{3}[-.]?\d{3}[-.]?\d{4}$/)) return 'phone';
  if (content.match(/^[{[][\s\S]*[}\]]$/)) return 'json';
  if (content.match(/<[^>]+>/)) return 'html';
  if (content.match(/^(function|const|let|var|import|export)/m)) return 'code';
  return 'text';
}
