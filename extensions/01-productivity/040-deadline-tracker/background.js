// Deadline Tracker - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ deadlines: [] });
    console.log('Deadline Tracker extension installed');
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    const count = message.count;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: count > 0 ? '#dc2626' : '#64748b' });
  }
});

// Handle reminder alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('deadline-')) {
    const parts = alarm.name.split('-');
    const deadlineId = parts[1];
    const daysRemaining = parseInt(parts[2]);

    const result = await chrome.storage.local.get(['deadlines']);
    const deadlines = result.deadlines || [];
    const deadline = deadlines.find(d => d.id === deadlineId);

    if (deadline && !deadline.completed) {
      let urgencyText;
      let iconEmoji;

      if (daysRemaining === 7) {
        urgencyText = '還有一週';
        iconEmoji = '📅';
      } else if (daysRemaining === 3) {
        urgencyText = '只剩3天';
        iconEmoji = '⚠️';
      } else if (daysRemaining === 1) {
        urgencyText = '明天到期';
        iconEmoji = '🚨';
      }

      const options = {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: `${iconEmoji} 截止日期提醒`,
        message: `「${deadline.title}」${urgencyText}！`,
        priority: daysRemaining === 1 ? 2 : 1,
        requireInteraction: daysRemaining <= 3
      };

      chrome.notifications.create(`deadline-notify-${deadlineId}-${daysRemaining}`, options);
    }
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('deadline-notify-')) {
    chrome.notifications.clear(notificationId);
  }
});

// Update badge on startup
chrome.runtime.onStartup.addListener(async () => {
  await updateBadgeFromStorage();
  await rescheduleAlarms();
});

async function updateBadgeFromStorage() {
  const result = await chrome.storage.local.get(['deadlines']);
  const deadlines = result.deadlines || [];

  const urgentCount = deadlines.filter(d => {
    if (d.completed) return false;
    const days = getDaysUntil(d.date);
    return days <= 3;
  }).length;

  chrome.action.setBadgeText({ text: urgentCount > 0 ? urgentCount.toString() : '' });
  chrome.action.setBadgeBackgroundColor({ color: urgentCount > 0 ? '#dc2626' : '#64748b' });
}

async function rescheduleAlarms() {
  const result = await chrome.storage.local.get(['deadlines']);
  const deadlines = result.deadlines || [];

  deadlines.forEach(deadline => {
    if (deadline.completed) return;

    const deadlineDate = new Date(deadline.date);
    deadlineDate.setHours(9, 0, 0, 0);

    const reminderDays = [7, 3, 1];

    for (const days of reminderDays) {
      const reminderTime = new Date(deadlineDate);
      reminderTime.setDate(reminderTime.getDate() - days);

      if (reminderTime > new Date()) {
        chrome.alarms.create(`deadline-${deadline.id}-${days}`, {
          when: reminderTime.getTime()
        });
      }
    }
  });
}

function getDaysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr);
  deadline.setHours(0, 0, 0, 0);
  const diff = deadline - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
