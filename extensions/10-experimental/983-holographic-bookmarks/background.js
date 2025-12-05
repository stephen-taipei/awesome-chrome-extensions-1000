// Background service worker for Holographic Bookmarks
chrome.runtime.onInstalled.addListener(() => {
  console.log('Holographic Bookmarks installed.');

  // Initialize spatial data
  chrome.storage.local.set({
    spatialPositions: {},
    depthLayers: {},
    accessFrequency: {}
  });
});

// Track bookmark access for depth layer calculations
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  chrome.storage.local.get(['spatialPositions'], (data) => {
    const positions = data.spatialPositions || {};
    // Assign initial 3D position
    positions[id] = {
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: 0 // New bookmarks start at front layer
    };
    chrome.storage.local.set({ spatialPositions: positions });
  });
});

// Update depth based on access frequency
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BOOKMARK_ACCESSED') {
    chrome.storage.local.get(['accessFrequency', 'depthLayers'], (data) => {
      const freq = data.accessFrequency || {};
      freq[message.bookmarkId] = (freq[message.bookmarkId] || 0) + 1;
      chrome.storage.local.set({ accessFrequency: freq });
      sendResponse({ success: true });
    });
    return true;
  }
});
