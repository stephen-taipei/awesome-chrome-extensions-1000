// Break Reminder - Background Service Worker

let settings = {
  interval: 30,
  duration: 60,
  isPaused: false
};

let state = {
  nextBreakTime: 0,
  isOnBreak: false
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const today = new Date().toDateString();
    const nextBreak = Date.now() + 30 * 60 * 1000;

    chrome.storage.local.set({
      breakReminderSettings: {
        interval: 30,
        duration: 60,
        isPaused: false
      },
      breakReminderState: {
        nextBreakTime: nextBreak,
        isOnBreak: false
      },
      breakReminderStats: {
        todayBreaks: 0,
        todayMinutes: 0,
        skippedBreaks: 0,
        date: today
      }
    });

    state.nextBreakTime = nextBreak;
    console.log('Break Reminder extension installed');
  }

  chrome.alarms.create('breakReminderCheck', { periodInMinutes: 1 / 60 }); // Every second
});

// Load state
async function loadState() {
  const result = await chrome.storage.local.get(['breakReminderSettings', 'breakReminderState']);
  if (result.breakReminderSettings) {
    settings = result.breakReminderSettings;
  }
  if (result.breakReminderState) {
    state = result.breakReminderState;
  }
}

loadState();

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'pauseReminder':
    case 'resumeReminder':
    case 'updateInterval':
    case 'breakTaken':
      loadState();
      break;
  }
});

// Check for break time
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'breakReminderCheck') {
    await loadState();

    if (settings.isPaused) {
      chrome.action.setBadgeText({ text: '⏸' });
      chrome.action.setBadgeBackgroundColor({ color: '#888' });
      return;
    }

    const now = Date.now();
    const remaining = Math.ceil((state.nextBreakTime - now) / 60000);

    if (remaining > 0) {
      chrome.action.setBadgeText({ text: remaining.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
    } else if (!state.isOnBreak) {
      // Time for a break!
      showBreakNotification();
      state.isOnBreak = true;
      await chrome.storage.local.set({ breakReminderState: state });
    }
  }
});

async function showBreakNotification() {
  const suggestions = [
    '👀 看向遠處 20 秒',
    '🧘 做幾次深呼吸',
    '💪 伸展你的手臂',
    '🚶 起身走動一下',
    '💧 喝杯水吧'
  ];

  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

  chrome.notifications.create('break-reminder', {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '☕ 休息時間到了！',
    message: suggestion,
    buttons: [
      { title: '✓ 休息一下' },
      { title: '✗ 稍後提醒' }
    ],
    requireInteraction: true,
    priority: 2
  });

  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId === 'break-reminder') {
    const result = await chrome.storage.local.get(['breakReminderSettings', 'breakReminderStats']);
    const settings = result.breakReminderSettings;
    let stats = result.breakReminderStats || {};

    const today = new Date().toDateString();
    if (stats.date !== today) {
      stats = { todayBreaks: 0, todayMinutes: 0, skippedBreaks: 0, date: today };
    }

    if (buttonIndex === 0) {
      // Take break
      stats.todayBreaks++;
      stats.todayMinutes += Math.ceil(settings.duration / 60);
    } else {
      // Skip
      stats.skippedBreaks++;
    }

    // Schedule next break
    state.nextBreakTime = Date.now() + settings.interval * 60 * 1000;
    state.isOnBreak = false;

    await chrome.storage.local.set({
      breakReminderState: state,
      breakReminderStats: stats
    });

    chrome.notifications.clear(notificationId);
  }
});

// Handle notification click
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId === 'break-reminder') {
    // Treat as taking a break
    const result = await chrome.storage.local.get(['breakReminderSettings', 'breakReminderStats']);
    const settings = result.breakReminderSettings;
    let stats = result.breakReminderStats || {};

    const today = new Date().toDateString();
    if (stats.date !== today) {
      stats = { todayBreaks: 0, todayMinutes: 0, skippedBreaks: 0, date: today };
    }

    stats.todayBreaks++;
    stats.todayMinutes += Math.ceil(settings.duration / 60);

    state.nextBreakTime = Date.now() + settings.interval * 60 * 1000;
    state.isOnBreak = false;

    await chrome.storage.local.set({
      breakReminderState: state,
      breakReminderStats: stats
    });

    chrome.notifications.clear(notificationId);
  }
});

// Track idle state
chrome.idle.onStateChanged.addListener(async (newState) => {
  await loadState();

  if (newState === 'idle' || newState === 'locked') {
    // User is away, pause the timer
    // Don't actually pause, but don't count idle time
  } else if (newState === 'active') {
    // User is back, they probably took a break
    if (state.isOnBreak) {
      // Count it as a break taken
      const result = await chrome.storage.local.get(['breakReminderSettings', 'breakReminderStats']);
      let stats = result.breakReminderStats || {};

      const today = new Date().toDateString();
      if (stats.date !== today) {
        stats = { todayBreaks: 0, todayMinutes: 0, skippedBreaks: 0, date: today };
      }

      stats.todayBreaks++;

      state.nextBreakTime = Date.now() + settings.interval * 60 * 1000;
      state.isOnBreak = false;

      await chrome.storage.local.set({
        breakReminderState: state,
        breakReminderStats: stats
      });
    }
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  loadState();
  chrome.alarms.create('breakReminderCheck', { periodInMinutes: 1 / 60 });
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.breakReminderSettings) {
      settings = changes.breakReminderSettings.newValue || settings;
    }
    if (changes.breakReminderState) {
      state = changes.breakReminderState.newValue || state;
    }
  }
});
