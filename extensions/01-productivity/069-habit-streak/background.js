// Habit Streak - Background Service Worker

// Set up daily reminder
chrome.runtime.onInstalled.addListener(() => {
  // Create daily alarm at 9 AM
  chrome.alarms.create('dailyReminder', {
    when: getNextReminderTime(),
    periodInMinutes: 24 * 60
  });
});

function getNextReminderTime() {
  const now = new Date();
  const reminder = new Date();
  reminder.setHours(9, 0, 0, 0);

  if (now > reminder) {
    reminder.setDate(reminder.getDate() + 1);
  }

  return reminder.getTime();
}

// Handle alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReminder') {
    const result = await chrome.storage.local.get('habitStreakData');
    const data = result.habitStreakData;

    if (data && data.habits.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const uncompleted = data.habits.filter(h => !h.completedDates.includes(today));

      if (uncompleted.length > 0) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '🔥 Habit Streak 提醒',
          message: `還有 ${uncompleted.length} 個習慣等待完成，保持你的連續紀錄！`,
          priority: 2
        });
      }
    }
  }
});
