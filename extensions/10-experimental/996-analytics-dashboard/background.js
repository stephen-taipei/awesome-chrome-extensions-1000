// Background service worker for Analytics Dashboard
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Analytics Dashboard installed.');
  // Initialize storage for analytics
  // Updates must preserve user data; setup below still runs.
  if (details.reason === 'install') {
    chrome.storage.local.set({
      installDate: new Date().toISOString(),
      stats: {
          activeCount: 0,
          memorySaved: 0
      }
    });
  }
});
