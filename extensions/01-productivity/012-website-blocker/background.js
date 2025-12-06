// Website Blocker Background Service Worker

let blockedSites = [];
let isEnabled = true;

// Load settings on startup
chrome.storage.local.get(['blockedSites', 'isEnabled'], (result) => {
  blockedSites = result.blockedSites || [];
  isEnabled = result.isEnabled !== false;
});

// Listen for updates from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'updateBlockList') {
    chrome.storage.local.get(['blockedSites', 'isEnabled'], (result) => {
      blockedSites = result.blockedSites || [];
      isEnabled = result.isEnabled !== false;
    });
  }
});

// Check navigation
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0 || !isEnabled) return;

  try {
    const url = new URL(details.url);
    const hostname = url.hostname.replace(/^www\./, '');

    const isBlocked = blockedSites.some(site =>
      hostname === site || hostname.endsWith('.' + site)
    );

    if (isBlocked) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(hostname)
      });
    }
  } catch (e) {
    // Invalid URL, ignore
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Website Blocker extension installed');
});
