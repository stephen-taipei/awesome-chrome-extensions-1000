// Background service worker for Neural Search
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Neural Search installed.');

  // Initialize default settings
  // Updates must preserve user data; setup below still runs.
  if (details.reason === 'install') {
    chrome.storage.local.set({
      enableMultiEngine: true,
      enableSemanticMatch: true,
      enableLearning: true,
      searchEngines: ['google', 'bing', 'duckduckgo']
    });
  }
});

// Listen for search queries
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Log search queries for learning
    console.log('Search detected:', details.url);
  },
  { urls: ['*://www.google.com/search*', '*://www.bing.com/search*', '*://duckduckgo.com/*'] }
);
