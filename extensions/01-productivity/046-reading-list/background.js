// Reading List - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ readingList: [] });
    console.log('Reading List extension installed');
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    const count = message.count;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
  }
});

// Update badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['readingList']);
  const articles = result.readingList || [];
  const unreadCount = articles.filter(a => !a.read).length;

  chrome.action.setBadgeText({ text: unreadCount > 0 ? unreadCount.toString() : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
});
