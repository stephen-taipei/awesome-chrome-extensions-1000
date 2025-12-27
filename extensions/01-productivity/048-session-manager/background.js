// Session Manager - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ savedSessions: [] });
    console.log('Session Manager extension installed');
  }
});
