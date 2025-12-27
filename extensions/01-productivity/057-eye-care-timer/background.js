// Eye Care Timer - Background Service Worker

let settings = {
  enabled: true,
  interval: 20,
  nextRestTime: null
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const nextRestTime = Date.now() + (20 * 60 * 1000);
    chrome.storage.local.set({
      eyeCareSettings: {
        enabled: true,
        interval: 20,
        nextRestTime,
        todayRests: 0,
        totalRests: 0,
        lastDate: new Date().toDateString()
      }
    });
    scheduleAlarm(20);
    console.log('Eye Care Timer extension installed');
  }
});

// Load settings on startup
chrome.runtime.onStartup.addListener(loadSettings);
loadSettings();

async function loadSettings() {
  const result = await chrome.storage.local.get('eyeCareSettings');
  if (result.eyeCareSettings) {
    settings = result.eyeCareSettings;
    if (settings.enabled && settings.nextRestTime) {
      const remaining = settings.nextRestTime - Date.now();
      if (remaining > 0) {
        scheduleAlarm(remaining / 60000);
      } else {
        scheduleAlarm(settings.interval);
      }
    }
  }
  updateBadge();
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'updateSettings':
      settings = message.settings;
      if (settings.enabled) {
        const remaining = settings.nextRestTime - Date.now();
        scheduleAlarm(remaining / 60000);
      } else {
        chrome.alarms.clear('eyeCareReminder');
      }
      updateBadge();
      break;

    case 'restTaken':
      scheduleAlarm(settings.interval);
      break;
  }
});

function scheduleAlarm(minutes) {
  chrome.alarms.clear('eyeCareReminder');
  chrome.alarms.create('eyeCareReminder', {
    delayInMinutes: Math.max(0.1, minutes)
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'eyeCareReminder') {
    showNotification();
    scheduleAlarm(settings.interval);
    updateNextRestTime();
  }
});

async function updateNextRestTime() {
  const result = await chrome.storage.local.get('eyeCareSettings');
  if (result.eyeCareSettings) {
    result.eyeCareSettings.nextRestTime = Date.now() + (settings.interval * 60 * 1000);
    await chrome.storage.local.set({ eyeCareSettings: result.eyeCareSettings });
  }
}

function showNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '👁️ 眼睛休息時間！',
    message: '看向 20 英尺（約 6 公尺）外的物體 20 秒，讓眼睛放鬆一下。',
    buttons: [
      { title: '✓ 已休息' },
      { title: '稍後提醒' }
    ],
    requireInteraction: true
  });
}

function updateBadge() {
  if (settings.enabled) {
    chrome.action.setBadgeText({ text: '' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#94a3b8' });
  }
}
