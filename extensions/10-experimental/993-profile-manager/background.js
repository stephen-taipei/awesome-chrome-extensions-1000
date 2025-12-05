// Background service worker for Profile Manager
chrome.runtime.onInstalled.addListener(() => {
  console.log('Profile Manager installed.');
  // Initialize default profile
  chrome.storage.local.set({ currentProfile: 'default' });
});
