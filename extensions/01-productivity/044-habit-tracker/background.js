// Habit Tracker - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ habits: [] });
    console.log('Habit Tracker extension installed');
  }
});
