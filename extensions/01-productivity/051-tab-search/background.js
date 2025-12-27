// Tab Search - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Tab Search extension installed');
  }
});
