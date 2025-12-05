// Background service worker for Focus Timer
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focus Timer installed.');

  chrome.storage.local.set({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    blockedSites: ['facebook.com', 'twitter.com', 'youtube.com', 'reddit.com'],
    isRunning: false,
    currentSession: 0,
    totalPomodoros: 0,
    dailyStats: {}
  });
});

let timerInterval = null;
let timeRemaining = 0;
let isWorkSession = true;

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer') {
    handleTimerComplete();
  }
});

function handleTimerComplete() {
  chrome.storage.local.get(['isRunning', 'currentSession', 'sessionsBeforeLongBreak'], (data) => {
    if (!data.isRunning) return;

    if (isWorkSession) {
      // Work session completed
      const newSession = data.currentSession + 1;
      chrome.storage.local.set({ currentSession: newSession });

      updateDailyStats();

      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Focus Session Complete!',
        message: 'Great work! Time for a break.',
        priority: 2
      });

      // Start break
      isWorkSession = false;
      const breakType = newSession % data.sessionsBeforeLongBreak === 0 ? 'long' : 'short';
      startBreak(breakType);
    } else {
      // Break completed
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Break Over!',
        message: 'Ready to focus again?',
        priority: 2
      });

      isWorkSession = true;
      chrome.storage.local.set({ isRunning: false });
    }
  });
}

function startBreak(type) {
  chrome.storage.local.get(['breakDuration', 'longBreakDuration'], (data) => {
    const duration = type === 'long' ? data.longBreakDuration : data.breakDuration;
    chrome.alarms.create('focusTimer', { delayInMinutes: duration });
  });
}

function updateDailyStats() {
  const today = new Date().toISOString().split('T')[0];
  chrome.storage.local.get(['dailyStats', 'totalPomodoros'], (data) => {
    const stats = data.dailyStats || {};
    stats[today] = (stats[today] || 0) + 1;
    chrome.storage.local.set({
      dailyStats: stats,
      totalPomodoros: (data.totalPomodoros || 0) + 1
    });
  });
}

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_FOCUS') {
    chrome.storage.local.get(['workDuration'], (data) => {
      isWorkSession = true;
      chrome.storage.local.set({ isRunning: true });
      chrome.alarms.create('focusTimer', { delayInMinutes: data.workDuration });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'STOP_FOCUS') {
    chrome.alarms.clear('focusTimer');
    chrome.storage.local.set({ isRunning: false });
    sendResponse({ success: true });
  }

  if (message.type === 'GET_STATUS') {
    chrome.alarms.get('focusTimer', (alarm) => {
      chrome.storage.local.get(['isRunning', 'currentSession', 'totalPomodoros'], (data) => {
        sendResponse({
          isRunning: data.isRunning,
          isWorkSession,
          currentSession: data.currentSession,
          totalPomodoros: data.totalPomodoros,
          timeRemaining: alarm ? Math.round((alarm.scheduledTime - Date.now()) / 1000) : 0
        });
      });
    });
    return true;
  }
});
