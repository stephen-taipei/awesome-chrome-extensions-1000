// Daily Goals - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      dailyGoals: {},
      dailyGoalsStats: {
        currentStreak: 0,
        bestStreak: 0,
        weeklyData: {}
      }
    });
    console.log('Daily Goals extension installed');

    // Set up daily reminder alarm
    chrome.alarms.create('dailyGoalReminder', {
      when: getNextReminderTime(),
      periodInMinutes: 24 * 60
    });
  }
});

function getNextReminderTime() {
  const now = new Date();
  const reminderTime = new Date(now);
  reminderTime.setHours(9, 0, 0, 0); // 9 AM

  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  return reminderTime.getTime();
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    chrome.action.setBadgeText({ text: message.text });
    if (message.color) {
      chrome.action.setBadgeBackgroundColor({ color: message.color });
    }
  }
});

// Daily reminder
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyGoalReminder') {
    const today = new Date().toISOString().split('T')[0];
    const result = await chrome.storage.local.get(['dailyGoals']);
    const goals = result.dailyGoals?.[today] || [];

    if (goals.length === 0) {
      chrome.notifications.create('daily-goals-reminder', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '🎯 設定今日目標',
        message: '新的一天開始了！設定 3-5 個今日目標吧。',
        priority: 2
      });
    }
  }
});

// Update badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const today = new Date().toISOString().split('T')[0];
  const result = await chrome.storage.local.get(['dailyGoals']);
  const goals = result.dailyGoals?.[today] || [];

  if (goals.length === 0) {
    chrome.action.setBadgeText({ text: '' });
  } else {
    const completed = goals.filter(g => g.completed).length;
    const total = goals.length;

    if (completed === total) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
    } else {
      chrome.action.setBadgeText({ text: `${completed}/${total}` });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    }
  }
});
