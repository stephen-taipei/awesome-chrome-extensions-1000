// Pomodoro Timer - Background Service Worker

let timerInterval = null;

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const today = new Date().toDateString();
    chrome.storage.local.set({
      pomodoroSettings: {
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        longBreakInterval: 4,
        autoStart: true,
        notifications: true
      },
      pomodoroState: {
        mode: 'work',
        isRunning: false,
        timeLeft: 25 * 60,
        totalTime: 25 * 60,
        sessionsCompleted: 0
      },
      pomodoroStats: {
        today: { pomodoros: 0, minutes: 0, date: today },
        total: { pomodoros: 0 }
      }
    });
    console.log('Pomodoro Timer extension installed');
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'startTimer':
      startTimer();
      break;
    case 'pauseTimer':
      pauseTimer();
      break;
    case 'stopTimer':
      stopTimer();
      break;
  }
});

async function startTimer() {
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Start the interval
  timerInterval = setInterval(async () => {
    try {
      const result = await chrome.storage.local.get(['pomodoroState', 'pomodoroSettings', 'pomodoroStats']);
      const state = result.pomodoroState;
      const settings = result.pomodoroSettings;
      let stats = result.pomodoroStats;

      if (!state.isRunning) {
        clearInterval(timerInterval);
        timerInterval = null;
        return;
      }

      state.timeLeft--;

      // Update badge
      const mins = Math.ceil(state.timeLeft / 60);
      chrome.action.setBadgeText({ text: mins > 0 ? mins.toString() : '!' });
      chrome.action.setBadgeBackgroundColor({
        color: state.mode === 'work' ? '#e74c3c' : '#27ae60'
      });

      if (state.timeLeft <= 0) {
        // Timer completed
        clearInterval(timerInterval);
        timerInterval = null;
        state.isRunning = false;

        if (state.mode === 'work') {
          // Completed a pomodoro
          state.sessionsCompleted++;

          // Update stats
          const today = new Date().toDateString();
          if (stats.today.date !== today) {
            stats.today = { pomodoros: 0, minutes: 0, date: today };
          }
          stats.today.pomodoros++;
          stats.today.minutes += settings.workTime;
          stats.total.pomodoros++;

          // Determine next break
          if (state.sessionsCompleted % settings.longBreakInterval === 0) {
            state.mode = 'longBreak';
            state.timeLeft = settings.longBreakTime * 60;
          } else {
            state.mode = 'shortBreak';
            state.timeLeft = settings.shortBreakTime * 60;
          }

          // Notify
          if (settings.notifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: '🍅 番茄完成！',
              message: `太棒了！完成了 ${stats.today.pomodoros} 個番茄。休息一下吧！`,
              priority: 2
            });
          }
        } else {
          // Break completed
          state.mode = 'work';
          state.timeLeft = settings.workTime * 60;

          // Notify
          if (settings.notifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: '⏰ 休息結束！',
              message: '準備好開始下一個番茄了嗎？',
              priority: 2
            });
          }
        }

        state.totalTime = state.timeLeft;

        // Auto start next session
        if (settings.autoStart) {
          state.isRunning = true;
          await chrome.storage.local.set({ pomodoroState: state, pomodoroStats: stats });
          startTimer();
          return;
        }

        chrome.action.setBadgeText({ text: '' });
      }

      await chrome.storage.local.set({ pomodoroState: state, pomodoroStats: stats });
    } catch (error) {
      console.error('Timer tick error:', error);
    }
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function stopTimer() {
  pauseTimer();
  chrome.action.setBadgeText({ text: '' });
}

// Restore timer state on startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    const result = await chrome.storage.local.get(['pomodoroState']);
    if (result.pomodoroState && result.pomodoroState.isRunning) {
      startTimer();
    }
  } catch (error) {
    console.error('Startup error:', error);
  }
});

// Use alarms for more reliable background timing
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTick') {
    // Backup tick mechanism
  }
});
