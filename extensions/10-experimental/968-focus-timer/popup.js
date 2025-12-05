document.addEventListener('DOMContentLoaded', () => {
  const timeDisplay = document.getElementById('time-display');
  const sessionType = document.getElementById('session-type');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const timerProgress = document.getElementById('timer-progress');

  let updateInterval = null;

  loadStatus();

  // Start timer
  startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'START_FOCUS' }, () => {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'inline-flex';
      startUpdateLoop();
    });
  });

  // Stop timer
  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_FOCUS' }, () => {
      startBtn.style.display = 'inline-flex';
      stopBtn.style.display = 'none';
      clearInterval(updateInterval);
      loadStatus();
    });
  });

  // Skip
  document.getElementById('skip-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_FOCUS' }, () => {
      startBtn.style.display = 'inline-flex';
      stopBtn.style.display = 'none';
      clearInterval(updateInterval);
      timeDisplay.textContent = formatTime(25 * 60);
    });
  });

  // Save duration settings
  ['work-duration', 'break-duration', 'long-break'].forEach(id => {
    document.getElementById(id).addEventListener('change', (e) => {
      const key = id === 'work-duration' ? 'workDuration' :
                  id === 'break-duration' ? 'breakDuration' : 'longBreakDuration';
      chrome.storage.local.set({ [key]: parseInt(e.target.value) });
    });
  });

  function loadStatus() {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
      if (response) {
        document.getElementById('session-count').textContent = response.currentSession || 0;
        document.getElementById('total-count').textContent = response.totalPomodoros || 0;

        if (response.isRunning) {
          startBtn.style.display = 'none';
          stopBtn.style.display = 'inline-flex';
          sessionType.textContent = response.isWorkSession ? 'Focus' : 'Break';
          startUpdateLoop();
        } else {
          timeDisplay.textContent = formatTime(25 * 60);
        }
      }
    });

    // Load today's count
    const today = new Date().toISOString().split('T')[0];
    chrome.storage.local.get(['dailyStats', 'workDuration', 'breakDuration', 'longBreakDuration'], (data) => {
      const stats = data.dailyStats || {};
      document.getElementById('today-count').textContent = stats[today] || 0;

      if (data.workDuration) document.getElementById('work-duration').value = data.workDuration;
      if (data.breakDuration) document.getElementById('break-duration').value = data.breakDuration;
      if (data.longBreakDuration) document.getElementById('long-break').value = data.longBreakDuration;
    });
  }

  function startUpdateLoop() {
    clearInterval(updateInterval);
    updateInterval = setInterval(() => {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
        if (response && response.isRunning && response.timeRemaining > 0) {
          timeDisplay.textContent = formatTime(response.timeRemaining);
          updateProgress(response.timeRemaining, response.isWorkSession ? 25 * 60 : 5 * 60);
        }
      });
    }, 1000);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateProgress(remaining, total) {
    const circumference = 2 * Math.PI * 45;
    const progress = (total - remaining) / total;
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = circumference * (1 - progress);
  }
});
