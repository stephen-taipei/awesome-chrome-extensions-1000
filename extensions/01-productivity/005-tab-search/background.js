/**
 * Tab Search - Background Service Worker
 * Handles background tasks and keyboard commands
 */

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      searchMode: 'fuzzy', // 'fuzzy', 'exact', 'regex'
      caseSensitive: false,
      searchFields: ['title', 'url'], // Fields to search in
      maxResults: 50,
      highlightMatch: true,
      autoFocus: true
    });
    console.log('Tab Search installed with default settings');
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'switchToTab') {
    chrome.tabs.update(message.tabId, { active: true });
    chrome.windows.update(message.windowId, { focused: true });
    sendResponse({ success: true });
  } else if (message.action === 'closeTab') {
    chrome.tabs.remove(message.tabId);
    sendResponse({ success: true });
  } else if (message.action === 'getAllTabs') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs });
    });
    return true; // Keep channel open for async response
  }
});

// Log service worker activation
console.log('Tab Search service worker activated');
