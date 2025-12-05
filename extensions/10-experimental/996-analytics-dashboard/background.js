// Background service worker for Analytics Dashboard
chrome.runtime.onInstalled.addListener(() => {
  console.log('Analytics Dashboard installed.');
  // Initialize storage for analytics
  chrome.storage.local.set({
    installDate: new Date().toISOString(),
    stats: {
        activeCount: 0,
        memorySaved: 0
    }
  });
});
