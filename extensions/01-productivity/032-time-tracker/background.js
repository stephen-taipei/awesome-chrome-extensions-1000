// Time Tracker - Background Service Worker

let isPaused = false;
let currentTabId = null;
let lastUpdateTime = Date.now();

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      timeTrackerData: {},
      timeTrackerPaused: false
    });
    console.log('Time Tracker extension installed');
  }

  // Start the tracking alarm
  chrome.alarms.create('timeTrackerTick', { periodInMinutes: 1 / 60 }); // Every 1 second
});

// Load initial state
chrome.storage.local.get(['timeTrackerPaused']).then(result => {
  isPaused = result.timeTrackerPaused || false;
});

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'toggleTracking') {
    isPaused = message.paused;
  }
});

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await saveCurrentTime();
  currentTabId = activeInfo.tabId;
  lastUpdateTime = Date.now();
});

// Track tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.url) {
    await saveCurrentTime();
    lastUpdateTime = Date.now();
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await saveCurrentTime();
    currentTabId = null;
  } else {
    try {
      const tabs = await chrome.tabs.query({ active: true, windowId });
      if (tabs[0]) {
        currentTabId = tabs[0].id;
        lastUpdateTime = Date.now();
      }
    } catch (error) {
      console.error('Error getting active tab:', error);
    }
  }
});

// Periodic time update
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'timeTrackerTick') {
    await saveCurrentTime();
    lastUpdateTime = Date.now();
    updateBadge();
  }
});

async function saveCurrentTime() {
  if (isPaused || !currentTabId) return;

  try {
    const tab = await chrome.tabs.get(currentTabId);
    if (!tab.url || !tab.url.startsWith('http')) return;

    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');

    // Calculate time since last update
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastUpdateTime) / 1000);
    if (elapsedSeconds <= 0) return;

    // Get today's date key
    const dateKey = new Date().toISOString().split('T')[0];

    // Update storage
    const result = await chrome.storage.local.get(['timeTrackerData']);
    const data = result.timeTrackerData || {};

    if (!data[dateKey]) {
      data[dateKey] = {};
    }

    data[dateKey][domain] = (data[dateKey][domain] || 0) + elapsedSeconds;

    await chrome.storage.local.set({ timeTrackerData: data });
  } catch (error) {
    // Tab might have been closed
    if (error.message?.includes('No tab')) {
      currentTabId = null;
    }
  }
}

async function updateBadge() {
  if (isPaused) {
    chrome.action.setBadgeText({ text: '⏸' });
    chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
    return;
  }

  try {
    const dateKey = new Date().toISOString().split('T')[0];
    const result = await chrome.storage.local.get(['timeTrackerData']);
    const data = result.timeTrackerData || {};
    const todayData = data[dateKey] || {};

    const totalSeconds = Object.values(todayData).reduce((sum, s) => sum + s, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let badgeText = '';
    if (hours > 0) {
      badgeText = `${hours}h`;
    } else if (minutes > 0) {
      badgeText = `${minutes}m`;
    }

    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } catch (error) {
    console.error('Badge update error:', error);
  }
}

// Initialize tracking on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['timeTrackerPaused']);
  isPaused = result.timeTrackerPaused || false;

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    currentTabId = tabs[0].id;
    lastUpdateTime = Date.now();
  }

  chrome.alarms.create('timeTrackerTick', { periodInMinutes: 1 / 60 });
  updateBadge();
});
