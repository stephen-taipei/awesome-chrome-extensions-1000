// Daily Journal - Background Service Worker

const ALARM_NAME = 'dailyJournalReminder';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default data
    await chrome.storage.local.set({
      journalEntries: {},
      journalTags: ['工作', '家庭', '健康', '學習', '運動', '社交', '休閒', '感恩'],
      journalSettings: {
        reminderEnabled: true,
        reminderTime: '21:00'
      }
    });

    // Set up daily reminder
    setupDailyReminder();

    console.log('Daily Journal extension installed');
  }
});

async function setupDailyReminder() {
  const result = await chrome.storage.local.get(['journalSettings']);
  const settings = result.journalSettings || { reminderEnabled: true, reminderTime: '21:00' };

  if (settings.reminderEnabled) {
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const now = new Date();
    let scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await chrome.alarms.create(ALARM_NAME, {
      when: scheduledTime.getTime(),
      periodInMinutes: 24 * 60 // Daily
    });
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    // Check if today's entry exists
    const today = new Date().toISOString().split('T')[0];
    const result = await chrome.storage.local.get(['journalEntries']);
    const entries = result.journalEntries || {};

    if (!entries[today] || !entries[today].content) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Daily Journal',
        message: '今天還沒寫日記喔！花幾分鐘記錄一下今天吧 📝',
        priority: 1
      });
    }
  }
});

// Update badge with streak
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['journalEntries']);
    const entries = result.journalEntries || {};

    // Calculate streak
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];

      if (entries[key] && entries[key].content) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    if (streak > 0) {
      chrome.action.setBadgeText({ text: String(streak) });
      chrome.action.setBadgeBackgroundColor({ color: '#f5576c' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.journalEntries) {
    updateBadge();
  }
});

updateBadge();
