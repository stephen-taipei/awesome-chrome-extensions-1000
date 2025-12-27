// Window Manager - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Window Manager extension installed');
  }
});
