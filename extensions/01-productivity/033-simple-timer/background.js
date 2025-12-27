// Simple Timer - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      simpleTimers: []
    });
    console.log('Simple Timer extension installed');
  }

  // Create the tick alarm
  chrome.alarms.create('simpleTimerTick', { periodInMinutes: 1 / 60 }); // Every second
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'simpleTimerTick') {
    await tickTimers();
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'startTimer':
    case 'resumeTimer':
    case 'pauseTimer':
    case 'deleteTimer':
      // These are handled by storage sync
      updateBadge();
      break;
  }
});

async function tickTimers() {
  try {
    const result = await chrome.storage.local.get(['simpleTimers']);
    let timers = result.simpleTimers || [];
    let hasChanges = false;
    let finishedTimers = [];

    timers = timers.map(timer => {
      if (timer.isRunning && timer.timeLeft > 0) {
        timer.timeLeft--;
        hasChanges = true;

        if (timer.timeLeft <= 0) {
          timer.isRunning = false;
          finishedTimers.push(timer);
        }
      }
      return timer;
    });

    if (hasChanges) {
      await chrome.storage.local.set({ simpleTimers: timers });
    }

    // Send notifications for finished timers
    for (const timer of finishedTimers) {
      chrome.notifications.create(`timer-${timer.id}`, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '⏲️ 計時結束！',
        message: timer.label || '計時器',
        priority: 2
      });
    }

    updateBadge();
  } catch (error) {
    console.error('Tick error:', error);
  }
}

async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['simpleTimers']);
    const timers = result.simpleTimers || [];
    const activeTimers = timers.filter(t => t.isRunning && t.timeLeft > 0);

    if (activeTimers.length === 0) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    // Show the nearest timer
    const nearestTimer = activeTimers.reduce((a, b) => a.timeLeft < b.timeLeft ? a : b);
    const mins = Math.ceil(nearestTimer.timeLeft / 60);

    chrome.action.setBadgeText({ text: mins > 99 ? '99+' : mins.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#00b894' });
  } catch (error) {
    console.error('Badge update error:', error);
  }
}

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('simpleTimerTick', { periodInMinutes: 1 / 60 });
  updateBadge();
});
