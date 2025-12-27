// Annotation Tool - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      annotationSettings: {
        tool: 'pen',
        color: '#FF0000',
        size: 3
      },
      annotations: {}
    });
    console.log('Annotation Tool extension installed');
  }
});

// Update badge with annotation count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['annotations']);
    const annotations = result.annotations || {};

    let total = 0;
    Object.values(annotations).forEach(arr => {
      total += arr.length;
    });

    if (total > 0) {
      chrome.action.setBadgeText({ text: total > 99 ? '99+' : String(total) });
      chrome.action.setBadgeBackgroundColor({ color: '#ee5a24' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.annotations) {
    updateBadge();
  }
});

updateBadge();
