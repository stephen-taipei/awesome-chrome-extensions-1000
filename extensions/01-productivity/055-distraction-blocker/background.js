// Distraction Blocker - Background Service Worker

let settings = {
  enabled: true,
  strictMode: false,
  scheduleEnabled: false,
  startTime: '09:00',
  endTime: '17:00',
  activeDays: [1, 2, 3, 4, 5],
  blockedSites: [],
  blockedToday: 0,
  lastResetDate: null
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      distractionBlockerSettings: {
        ...settings,
        blockedSites: [
          'facebook.com',
          'twitter.com',
          'instagram.com',
          'tiktok.com',
          'reddit.com'
        ]
      }
    });
    console.log('Distraction Blocker extension installed');
  }
});

// Load settings on startup
chrome.runtime.onStartup.addListener(loadSettings);

// Also load settings when service worker starts
loadSettings();

async function loadSettings() {
  const result = await chrome.storage.local.get('distractionBlockerSettings');
  if (result.distractionBlockerSettings) {
    settings = result.distractionBlockerSettings;
  }
  updateBadge();
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    settings = message.settings;
    updateBadge();
  }
});

// Check tabs for blocked sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  checkAndBlock(tabId, changeInfo.url);
});

async function checkAndBlock(tabId, url) {
  if (!settings.enabled) return;

  // Check schedule
  if (settings.scheduleEnabled && !isWithinSchedule()) return;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');

    const isBlocked = settings.blockedSites.some(site =>
      hostname === site || hostname.endsWith('.' + site)
    );

    if (isBlocked) {
      // Redirect to blocked page
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('blocked.html')
      });

      // Update blocked count
      settings.blockedToday++;
      await chrome.storage.local.set({
        distractionBlockerSettings: settings
      });
    }
  } catch (e) {
    // Invalid URL, ignore
  }
}

function isWithinSchedule() {
  const now = new Date();
  const currentDay = now.getDay();

  if (!settings.activeDays.includes(currentDay)) return false;

  const [startHour, startMin] = settings.startTime.split(':').map(Number);
  const [endHour, endMin] = settings.endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function updateBadge() {
  if (settings.enabled) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#94a3b8' });
  }
}

// Reset daily counter at midnight
chrome.alarms.create('dailyReset', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    settings.blockedToday = 0;
    settings.lastResetDate = new Date().toDateString();
    chrome.storage.local.set({ distractionBlockerSettings: settings });
  }
});

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}
