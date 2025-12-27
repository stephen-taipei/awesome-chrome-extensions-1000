// Quick Memo - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      quickMemos: []
    });
    console.log('Quick Memo extension installed');
  }
});

// Handle badge updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    const count = message.count;
    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : ''
    });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  }
});

// Update badge on startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    const result = await chrome.storage.local.get(['quickMemos']);
    const memos = result.quickMemos || [];
    const activeCount = memos.filter(m => !m.completed).length;

    chrome.action.setBadgeText({
      text: activeCount > 0 ? activeCount.toString() : ''
    });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
});
