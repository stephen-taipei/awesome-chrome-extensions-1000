// Background service worker for Profile Manager
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Profile Manager installed.');
  // Initialize default profile
  // Updates must preserve user data; setup below still runs.
  if (details.reason === 'install') {
    chrome.storage.local.set({ currentProfile: 'default' });
  }
});
