document.addEventListener('DOMContentLoaded', () => {
  const timerMode = document.getElementById('timerMode');
  const timerTime = document.getElementById('timerTime');
  const ringProgress = document.getElementById('ringProgress');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const focusDuration = document.getElementById('focusDuration');
  const shortDuration = document.getElementById('shortDuration');
  const longDuration = document.getElementById('longDuration');
  const focusValue = document.getElementById('focusValue');
  const shortValue = document.getElementById('shortValue');
  const longValue = document.getElementById('longValue');
  const sessionsToday = document.getElementById('sessionsToday');
  const totalFocus = document.getElementById('totalFocus');

  let settings = {
    focus: 25,
    short: 5,
    long: 15
  };

  let currentMode = 'focus';
  let timeLeft = settings.focus * 60;
  let totalTime = settings.focus * 60;
  let isRunning = false;
  let intervalId = null;

  loadSettings();
  loadStats();
  updateDisplay();

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      setModeTime();
      updateDisplay();
    });
  });

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  resetBtn.addEventListener('click', () => {
    pauseTimer();
    setModeTime();
    updateDisplay();
  });

  [focusDuration, shortDuration, longDuration].forEach(input => {
    input.addEventListener('input', () => {
      settings.focus = parseInt(focusDuration.value);
      settings.short = parseInt(shortDuration.value);
      settings.long = parseInt(longDuration.value);

      focusValue.textContent = settings.focus;
      shortValue.textContent = settings.short;
      longValue.textContent = settings.long;

      if (!isRunning) {
        setModeTime();
        updateDisplay();
      }

      saveSettings();
    });
  });

  function startTimer() {
    isRunning = true;
    startBtn.textContent = 'Pause';

    intervalId = setInterval(() => {
      timeLeft--;

      if (timeLeft <= 0) {
        pauseTimer();
        onTimerComplete();
      }

      updateDisplay();
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    startBtn.textContent = 'Start';
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function setModeTime() {
    switch (currentMode) {
      case 'focus':
        timeLeft = settings.focus * 60;
        totalTime = settings.focus * 60;
        timerMode.textContent = 'Focus Time';
        break;
      case 'short':
        timeLeft = settings.short * 60;
        totalTime = settings.short * 60;
        timerMode.textContent = 'Short Break';
        break;
      case 'long':
        timeLeft = settings.long * 60;
        totalTime = settings.long * 60;
        timerMode.textContent = 'Long Break';
        break;
    }
  }

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const progress = (timeLeft / totalTime) * 283;
    ringProgress.style.strokeDashoffset = 283 - progress;
  }

  function onTimerComplete() {
    if (currentMode === 'focus') {
      updateStats();
    }

    if (Notification.permission === 'granted') {
      new Notification('Study Timer', {
        body: currentMode === 'focus' ? 'Great job! Take a break.' : 'Break over! Time to focus.',
        icon: 'icons/icon48.png'
      });
    }
  }

  function loadSettings() {
    chrome.storage.local.get(['timerSettings'], (result) => {
      if (result.timerSettings) {
        settings = { ...settings, ...result.timerSettings };
        focusDuration.value = settings.focus;
        shortDuration.value = settings.short;
        longDuration.value = settings.long;
        focusValue.textContent = settings.focus;
        shortValue.textContent = settings.short;
        longValue.textContent = settings.long;
        setModeTime();
        updateDisplay();
      }
    });
  }

  function saveSettings() {
    chrome.storage.local.set({ timerSettings: settings });
  }

  function loadStats() {
    chrome.storage.local.get(['studyStats'], (result) => {
      const stats = result.studyStats || { sessions: 0, totalMinutes: 0, lastDate: null };
      const today = new Date().toDateString();

      if (stats.lastDate !== today) {
        stats.sessions = 0;
        stats.lastDate = today;
      }

      sessionsToday.textContent = stats.sessions;
      totalFocus.textContent = `${Math.floor(stats.totalMinutes / 60)}h`;
    });
  }

  function updateStats() {
    chrome.storage.local.get(['studyStats'], (result) => {
      const stats = result.studyStats || { sessions: 0, totalMinutes: 0, lastDate: null };
      const today = new Date().toDateString();

      if (stats.lastDate !== today) {
        stats.sessions = 0;
        stats.lastDate = today;
      }

      stats.sessions++;
      stats.totalMinutes += settings.focus;

      chrome.storage.local.set({ studyStats: stats });

      sessionsToday.textContent = stats.sessions;
      totalFocus.textContent = `${Math.floor(stats.totalMinutes / 60)}h`;
    });
  }
});
