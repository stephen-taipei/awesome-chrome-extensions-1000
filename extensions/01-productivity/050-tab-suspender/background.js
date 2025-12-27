// Tab Suspender - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      tabSuspenderSettings: { autoSuspendMinutes: 30 },
      suspendedTabsData: {}
    });
    console.log('Tab Suspender extension installed');
  }
});

// Track tab activity for auto-suspend
const tabLastActive = new Map();

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  tabLastActive.set(activeInfo.tabId, Date.now());
});

// Check for idle tabs periodically
chrome.alarms.create('checkIdleTabs', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkIdleTabs') {
    const result = await chrome.storage.local.get(['tabSuspenderSettings']);
    const settings = result.tabSuspenderSettings || { autoSuspendMinutes: 30 };

    if (settings.autoSuspendMinutes === 0) return;

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const now = Date.now();
    const threshold = settings.autoSuspendMinutes * 60 * 1000;

    for (const tab of tabs) {
      if (tab.id === activeTab.id) continue;
      if (tab.discarded) continue;
      if (tab.url.startsWith('chrome://')) continue;
      if (tab.audible) continue; // Don't suspend tabs playing audio
      if (tab.pinned) continue; // Don't suspend pinned tabs

      const lastActive = tabLastActive.get(tab.id) || tab.lastAccessed || 0;

      if (now - lastActive > threshold) {
        try {
          await chrome.tabs.discard(tab.id);
        } catch (error) {
          // Tab might be in a state where it can't be discarded
        }
      }
    }
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabLastActive.delete(tabId);
});
