// Break Reminder - Background Service Worker

let settings = {
  enabled: true,
  interval: 25,
  breakDuration: 5,
  activities: ['stretch', 'eyes', 'water'],
  nextBreakTime: null
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const nextBreakTime = Date.now() + (25 * 60 * 1000);
    chrome.storage.local.set({
      breakReminderSettings: {
        enabled: true,
        interval: 25,
        breakDuration: 5,
        activities: ['stretch', 'eyes', 'water'],
        nextBreakTime,
        todayBreaks: 0,
        totalBreaks: 0,
        streak: 0,
        lastDate: new Date().toDateString()
      }
    });
    scheduleAlarm(25);
    console.log('Break Reminder extension installed');
  }
});

// Load settings on startup
chrome.runtime.onStartup.addListener(loadSettings);
loadSettings();

async function loadSettings() {
  const result = await chrome.storage.local.get('breakReminderSettings');
  if (result.breakReminderSettings) {
    settings = result.breakReminderSettings;
    if (settings.enabled && settings.nextBreakTime) {
      const remaining = settings.nextBreakTime - Date.now();
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
        const remaining = settings.nextBreakTime - Date.now();
        scheduleAlarm(remaining / 60000);
      } else {
        chrome.alarms.clear('breakReminder');
      }
      updateBadge();
      break;

    case 'breakTaken':
      scheduleAlarm(settings.interval);
      break;
  }
});

function scheduleAlarm(minutes) {
  chrome.alarms.clear('breakReminder');
  chrome.alarms.create('breakReminder', {
    delayInMinutes: Math.max(0.1, minutes)
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'breakReminder') {
    showBreakNotification();
    // Schedule next one
    scheduleAlarm(settings.interval);
    updateNextBreakTime();
  }
});

async function updateNextBreakTime() {
  const result = await chrome.storage.local.get('breakReminderSettings');
  if (result.breakReminderSettings) {
    result.breakReminderSettings.nextBreakTime = Date.now() + (settings.interval * 60 * 1000);
    await chrome.storage.local.set({ breakReminderSettings: result.breakReminderSettings });
  }
}

function showBreakNotification() {
  const activityMessages = {
    stretch: '🤸 伸展一下身體',
    eyes: '👀 閉眼休息 20 秒',
    water: '💧 喝杯水吧',
    walk: '🚶 走動一下'
  };

  const activity = settings.activities[Math.floor(Math.random() * settings.activities.length)];
  const message = activityMessages[activity] || '該休息一下了！';

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '☕ 休息時間到！',
    message: message + '\n\n' + `休息 ${settings.breakDuration} 分鐘，讓自己充電一下。`,
    buttons: [
      { title: '開始休息' },
      { title: '跳過這次' }
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
