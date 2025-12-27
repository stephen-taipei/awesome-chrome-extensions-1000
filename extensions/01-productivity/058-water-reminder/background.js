// Water Reminder - Background Service Worker

let data = {
  enabled: true,
  goal: 2000,
  interval: 45
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      waterReminderData: {
        enabled: true,
        goal: 2000,
        interval: 45,
        todayIntake: 0,
        todayLog: [],
        streak: 0,
        history: [],
        lastDate: new Date().toDateString()
      }
    });
    scheduleReminder(45);
    console.log('Water Reminder extension installed');
  }
});

// Load data on startup
chrome.runtime.onStartup.addListener(loadData);
loadData();

async function loadData() {
  const result = await chrome.storage.local.get('waterReminderData');
  if (result.waterReminderData) {
    data = result.waterReminderData;
    if (data.enabled) {
      scheduleReminder(data.interval);
    }
  }
  updateBadge();
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'updateData':
      data = message.data;
      if (data.enabled) {
        scheduleReminder(data.interval);
      } else {
        chrome.alarms.clear('waterReminder');
      }
      updateBadge();
      break;

    case 'goalReached':
      showGoalNotification();
      break;
  }
});

function scheduleReminder(minutes) {
  chrome.alarms.clear('waterReminder');
  chrome.alarms.create('waterReminder', {
    delayInMinutes: minutes,
    periodInMinutes: minutes
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'waterReminder' && data.enabled) {
    showReminderNotification();
  }
});

function showReminderNotification() {
  const messages = [
    '該喝水了！保持水分對健康很重要。',
    '休息一下，喝杯水吧！💧',
    '水是生命之源，記得補充水分！',
    '你今天喝了多少水了呢？',
    '來杯水吧，讓身體保持活力！'
  ];

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '💧 喝水時間！',
    message: messages[Math.floor(Math.random() * messages.length)],
    buttons: [
      { title: '✓ 已喝水' },
      { title: '稍後提醒' }
    ],
    requireInteraction: true
  });
}

function showGoalNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '🎉 恭喜達標！',
    message: '太棒了！你今天已經達成喝水目標了！繼續保持！',
    requireInteraction: false
  });
}

function updateBadge() {
  if (data.enabled && data.todayIntake >= data.goal) {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  } else if (data.enabled) {
    const percent = Math.round((data.todayIntake / data.goal) * 100);
    chrome.action.setBadgeText({ text: `${percent}%` });
    chrome.action.setBadgeBackgroundColor({ color: '#06b6d4' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#94a3b8' });
  }
}
