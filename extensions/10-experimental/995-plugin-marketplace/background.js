// Background service worker for Plugin Marketplace
chrome.runtime.onInstalled.addListener(() => {
  console.log('Plugin Marketplace installed.');
});
