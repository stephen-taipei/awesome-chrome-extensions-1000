// Mind Map Note - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      mindMapData: { nodes: [], connections: [] }
    });
    console.log('Mind Map Note extension installed');
  }
});

// Update badge with node count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['mindMapData']);
    const data = result.mindMapData || { nodes: [] };
    const count = data.nodes.length;

    if (count > 0) {
      chrome.action.setBadgeText({ text: String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.mindMapData) {
    updateBadge();
  }
});

updateBadge();
