// Reading List - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      readingList: []
    });
    console.log('Reading List extension installed');
  }
});

// Update badge with unread count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['readingList']);
    const articles = result.readingList || [];
    const unread = articles.filter(a => a.status === 'unread').length;

    if (unread > 0) {
      chrome.action.setBadgeText({ text: unread > 99 ? '99+' : String(unread) });
      chrome.action.setBadgeBackgroundColor({ color: '#4facfe' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.readingList) {
    updateBadge();
  }
});

updateBadge();
