// Stretch Reminder - Background Service Worker

let data = {
  enabled: true,
  interval: 30
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      stretchReminderData: {
        enabled: true,
        interval: 30,
        categories: ['neck', 'shoulders', 'back'],
        todayStretches: 0,
        totalStretches: 0,
        streak: 0,
        nextStretchTime: Date.now() + (30 * 60 * 1000),
        lastDate: new Date().toDateString()
      }
    });
    scheduleReminder(30);
    console.log('Stretch Reminder extension installed');
  }
});

// Load data on startup
chrome.runtime.onStartup.addListener(loadData);
loadData();

async function loadData() {
  const result = await chrome.storage.local.get('stretchReminderData');
  if (result.stretchReminderData) {
    data = result.stretchReminderData;
    if (data.enabled) {
      const remaining = (data.nextStretchTime - Date.now()) / 60000;
      scheduleReminder(remaining > 0 ? remaining : data.interval);
    }
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateData') {
    data = message.data;
    if (data.enabled) {
      const remaining = (data.nextStretchTime - Date.now()) / 60000;
      scheduleReminder(remaining > 0 ? remaining : data.interval);
    } else {
      chrome.alarms.clear('stretchReminder');
    }
  }
});

function scheduleReminder(minutes) {
  chrome.alarms.clear('stretchReminder');
  chrome.alarms.create('stretchReminder', {
    delayInMinutes: Math.max(0.1, minutes)
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'stretchReminder' && data.enabled) {
    showNotification();
    scheduleReminder(data.interval);
    updateNextStretchTime();
  }
});

async function updateNextStretchTime() {
  const result = await chrome.storage.local.get('stretchReminderData');
  if (result.stretchReminderData) {
    result.stretchReminderData.nextStretchTime = Date.now() + (data.interval * 60 * 1000);
    await chrome.storage.local.set({ stretchReminderData: result.stretchReminderData });
  }
}

function showNotification() {
  const messages = [
    '站起來伸展一下身體吧！',
    '該活動筋骨了！',
    '讓僵硬的肌肉放鬆一下！',
    '伸展時間到！動動身體！',
    '休息一下，做些簡單的伸展運動！'
  ];

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '🤸 伸展時間！',
    message: messages[Math.floor(Math.random() * messages.length)],
    buttons: [
      { title: '開始伸展' },
      { title: '稍後提醒' }
    ],
    requireInteraction: true
  });
}
