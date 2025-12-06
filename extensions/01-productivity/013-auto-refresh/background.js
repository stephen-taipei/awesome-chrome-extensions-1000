// Auto Refresh Background Service Worker

const refreshIntervals = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startRefresh') {
    startRefresh(message.tabId, message.interval);
  } else if (message.type === 'stopRefresh') {
    stopRefresh(message.tabId);
  }
});

function startRefresh(tabId, interval) {
  stopRefresh(tabId); // Clear any existing interval

  const intervalId = setInterval(() => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        stopRefresh(tabId);
        return;
      }
      chrome.tabs.reload(tabId);
    });
  }, interval * 1000);

  refreshIntervals.set(tabId, intervalId);
}

function stopRefresh(tabId) {
  if (refreshIntervals.has(tabId)) {
    clearInterval(refreshIntervals.get(tabId));
    refreshIntervals.delete(tabId);
  }
}

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  stopRefresh(tabId);

  chrome.storage.local.get(['refreshTabs'], (result) => {
    const refreshTabs = result.refreshTabs || {};
    delete refreshTabs[tabId];
    chrome.storage.local.set({ refreshTabs });
  });
});

// Restore refresh on startup
chrome.storage.local.get(['refreshTabs'], (result) => {
  const refreshTabs = result.refreshTabs || {};
  for (const [tabId, data] of Object.entries(refreshTabs)) {
    startRefresh(parseInt(tabId), data.interval);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto Refresh extension installed');
});
