// Outline Notes - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      outlineItems: []
    });
    console.log('Outline Notes extension installed');
  }
});

// Update badge with item count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['outlineItems']);
    const items = result.outlineItems || [];

    const countItems = (arr) => {
      return arr.reduce((count, item) => {
        return count + 1 + (item.children ? countItems(item.children) : 0);
      }, 0);
    };

    const count = countItems(items);

    if (count > 0) {
      chrome.action.setBadgeText({ text: count > 99 ? '99+' : String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#11998e' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.outlineItems) {
    updateBadge();
  }
});

updateBadge();
