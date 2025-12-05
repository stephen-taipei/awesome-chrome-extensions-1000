// Background service worker for Tab Hibernator
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Hibernator installed.');

  chrome.storage.local.set({
    hibernatedTabs: [],
    whitelist: [],
    idleTimeout: 30, // minutes
    autoHibernate: true,
    totalMemorySaved: 0
  });

  // Set up alarm for checking idle tabs
  chrome.alarms.create('checkIdleTabs', { periodInMinutes: 5 });
});

// Track tab activity
const tabLastActive = {};

chrome.tabs.onActivated.addListener((activeInfo) => {
  tabLastActive[activeInfo.tabId] = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    tabLastActive[tabId] = Date.now();
  }
});

// Check for idle tabs
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkIdleTabs') {
    chrome.storage.local.get(['autoHibernate', 'idleTimeout', 'whitelist'], (data) => {
      if (!data.autoHibernate) return;

      const timeout = (data.idleTimeout || 30) * 60 * 1000;
      const whitelist = data.whitelist || [];
      const now = Date.now();

      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          const lastActive = tabLastActive[tab.id] || now;
          const isWhitelisted = whitelist.some(domain => tab.url && tab.url.includes(domain));

          if (!isWhitelisted && now - lastActive > timeout && !tab.active) {
            hibernateTab(tab);
          }
        });
      });
    });
  }
});

function hibernateTab(tab) {
  chrome.storage.local.get(['hibernatedTabs'], (data) => {
    const hibernated = data.hibernatedTabs || [];
    hibernated.push({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      favicon: tab.favIconUrl,
      hibernatedAt: Date.now()
    });
    chrome.storage.local.set({ hibernatedTabs: hibernated });
    chrome.tabs.discard(tab.id);
  });
}

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'HIBERNATE_TAB') {
    chrome.tabs.get(message.tabId, (tab) => {
      hibernateTab(tab);
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'WAKE_TAB') {
    chrome.tabs.reload(message.tabId);
    sendResponse({ success: true });
  }
});
