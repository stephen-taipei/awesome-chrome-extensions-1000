// Page Highlighter - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      highlighterSettings: {
        color: '#FFEB3B',
        enabled: true
      },
      highlights: {}
    });
    console.log('Page Highlighter extension installed');
  }
});

// Update badge with highlight count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['highlights']);
    const highlights = result.highlights || {};

    let total = 0;
    Object.values(highlights).forEach(arr => {
      total += arr.length;
    });

    if (total > 0) {
      chrome.action.setBadgeText({ text: total > 99 ? '99+' : String(total) });
      chrome.action.setBadgeBackgroundColor({ color: '#FFA726' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.highlights) {
    updateBadge();
  }
});

updateBadge();
