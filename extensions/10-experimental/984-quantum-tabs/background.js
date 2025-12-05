// Background service worker for Quantum Tabs
chrome.runtime.onInstalled.addListener(() => {
  console.log('Quantum Tabs installed.');

  // Initialize quantum state storage
  chrome.storage.local.set({
    entangledGroups: [],
    tabStates: {},
    probabilityModel: {}
  });
});

// Track tab activity for probability predictions
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get(['probabilityModel'], (data) => {
    const model = data.probabilityModel || {};
    const tabId = activeInfo.tabId;
    model[tabId] = (model[tabId] || 0) + 1;
    chrome.storage.local.set({ probabilityModel: model });
  });
});

// Handle tab entanglement sync
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENTANGLE_TABS') {
    console.log('Entangling tabs:', message.tabIds);
    sendResponse({ success: true });
  }
});
