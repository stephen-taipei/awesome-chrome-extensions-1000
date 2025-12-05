// Background service worker for Screenshot Master
chrome.runtime.onInstalled.addListener(() => {
  console.log('Screenshot Master installed.');

  chrome.storage.local.set({
    format: 'png',
    quality: 90,
    saveLocation: 'downloads',
    screenshotHistory: []
  });
});

// Handle screenshot capture
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_VISIBLE') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        saveToHistory(dataUrl);
        sendResponse({ success: true, dataUrl });
      }
    });
    return true;
  }

  if (message.type === 'DOWNLOAD_SCREENSHOT') {
    const filename = `screenshot_${Date.now()}.png`;
    chrome.downloads.download({
      url: message.dataUrl,
      filename: filename,
      saveAs: message.saveAs || false
    }, (downloadId) => {
      sendResponse({ success: true, downloadId });
    });
    return true;
  }
});

function saveToHistory(dataUrl) {
  chrome.storage.local.get(['screenshotHistory'], (data) => {
    const history = data.screenshotHistory || [];
    history.unshift({
      id: Date.now(),
      thumbnail: dataUrl.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });
    if (history.length > 20) history.pop();
    chrome.storage.local.set({ screenshotHistory: history });
  });
}
