// Focus Mode - Background Service Worker

let isBlocking = false;
let blockedSites = [];

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      blockedSites: [
        'facebook.com',
        'twitter.com',
        'instagram.com',
        'youtube.com',
        'tiktok.com'
      ],
      focusState: { isActive: false, endTime: null, duration: 25 },
      focusStats: { todaySessions: 0, todayMinutes: 0, streak: 0, lastDate: null }
    });
    console.log('Focus Mode extension installed');
  }
});

// Check if focus session is active on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['focusState', 'blockedSites']);
  if (result.focusState?.isActive && result.focusState.endTime > Date.now()) {
    isBlocking = true;
    blockedSites = result.blockedSites || [];

    // Set alarm for session end
    const remaining = result.focusState.endTime - Date.now();
    chrome.alarms.create('focusEnd', { delayInMinutes: remaining / 60000 });

    updateBadge(true);
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startFocus':
      isBlocking = true;
      blockedSites = message.blockedSites;
      chrome.alarms.create('focusEnd', { delayInMinutes: message.duration });
      updateBadge(true);
      break;

    case 'stopFocus':
      isBlocking = false;
      blockedSites = [];
      chrome.alarms.clear('focusEnd');
      updateBadge(false);
      break;

    case 'completeFocus':
      isBlocking = false;
      blockedSites = [];
      updateBadge(false);
      showNotification();
      break;
  }
});

// Alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusEnd') {
    isBlocking = false;
    blockedSites = [];
    updateBadge(false);
    showNotification();

    // Update storage
    chrome.storage.local.get(['focusState', 'focusStats'], (result) => {
      const stats = result.focusStats || {};
      const state = result.focusState || {};

      const today = new Date().toDateString();
      if (stats.lastDate !== today) {
        stats.streak = (stats.streak || 0) + 1;
      }
      stats.todaySessions = (stats.todaySessions || 0) + 1;
      stats.todayMinutes = (stats.todayMinutes || 0) + (state.duration || 25);
      stats.lastDate = today;

      chrome.storage.local.set({
        focusState: { isActive: false, endTime: null, duration: 25 },
        focusStats: stats
      });
    });
  }
});

// Block tabs navigation to blocked sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isBlocking || !changeInfo.url) return;

  try {
    const url = new URL(changeInfo.url);
    const hostname = url.hostname.replace(/^www\./, '');

    if (blockedSites.some(site => hostname.includes(site))) {
      // Redirect to blocked page
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('blocked.html')
      });
    }
  } catch (e) {
    // Invalid URL, ignore
  }
});

function updateBadge(active) {
  if (active) {
    chrome.action.setBadgeText({ text: '🎯' });
    chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function showNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '專注時段完成！',
    message: '太棒了！你完成了一個專注時段。休息一下吧！'
  });
}
