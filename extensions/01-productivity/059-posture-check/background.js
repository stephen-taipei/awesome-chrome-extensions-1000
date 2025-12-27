// Posture Check - Background Service Worker

let data = {
  enabled: true,
  interval: 20
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      postureCheckData: {
        enabled: true,
        interval: 20,
        goodCount: 0,
        badCount: 0,
        nextCheckTime: Date.now() + (20 * 60 * 1000),
        lastDate: new Date().toDateString()
      }
    });
    scheduleReminder(20);
    console.log('Posture Check extension installed');
  }
});

// Load data on startup
chrome.runtime.onStartup.addListener(loadData);
loadData();

async function loadData() {
  const result = await chrome.storage.local.get('postureCheckData');
  if (result.postureCheckData) {
    data = result.postureCheckData;
    if (data.enabled) {
      const remaining = (data.nextCheckTime - Date.now()) / 60000;
      scheduleReminder(remaining > 0 ? remaining : data.interval);
    }
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateData') {
    data = message.data;
    if (data.enabled) {
      const remaining = (data.nextCheckTime - Date.now()) / 60000;
      scheduleReminder(remaining > 0 ? remaining : data.interval);
    } else {
      chrome.alarms.clear('postureReminder');
    }
  }
});

function scheduleReminder(minutes) {
  chrome.alarms.clear('postureReminder');
  chrome.alarms.create('postureReminder', {
    delayInMinutes: Math.max(0.1, minutes)
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'postureReminder' && data.enabled) {
    showNotification();
    scheduleReminder(data.interval);
    updateNextCheckTime();
  }
});

async function updateNextCheckTime() {
  const result = await chrome.storage.local.get('postureCheckData');
  if (result.postureCheckData) {
    result.postureCheckData.nextCheckTime = Date.now() + (data.interval * 60 * 1000);
    await chrome.storage.local.set({ postureCheckData: result.postureCheckData });
  }
}

function showNotification() {
  const tips = [
    '背部挺直了嗎？',
    '肩膀放鬆下沉了嗎？',
    '雙腳有平放在地面嗎？',
    '螢幕是否與眼睛平視？',
    '手肘是否呈 90 度？'
  ];

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '🧍 姿勢檢查時間！',
    message: tips[Math.floor(Math.random() * tips.length)],
    buttons: [
      { title: '👍 姿勢正確' },
      { title: '👎 需要調整' }
    ],
    requireInteraction: true
  });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  const result = await chrome.storage.local.get('postureCheckData');
  if (result.postureCheckData) {
    if (buttonIndex === 0) {
      result.postureCheckData.goodCount++;
    } else {
      result.postureCheckData.badCount++;
    }
    await chrome.storage.local.set({ postureCheckData: result.postureCheckData });
  }
  chrome.notifications.clear(notificationId);
});
