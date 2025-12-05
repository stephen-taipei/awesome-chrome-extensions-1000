document.addEventListener('DOMContentLoaded', () => {
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const progressCircle = document.getElementById('progressCircle');
  const timerCircle = document.getElementById('timerCircle');
  const taskNameInput = document.getElementById('taskName');
  const sessionsCountEl = document.getElementById('sessionsCount');
  const totalTimeEl = document.getElementById('totalTime');
  const modeBtns = document.querySelectorAll('.mode-btn');

  const MODES = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  let currentMode = 'work';
  let totalSeconds = MODES.work;
  let remainingSeconds = totalSeconds;
  let isRunning = false;
  let intervalId = null;
  let sessions = 0;
  let totalMinutesWorked = 0;

  // Load saved stats
  chrome.storage.local.get(['sessions', 'totalMinutes'], (result) => {
    sessions = result.sessions || 0;
    totalMinutesWorked = result.totalMinutes || 0;
    updateStats();
  });

  function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    minutesEl.textContent = mins.toString().padStart(2, '0');
    secondsEl.textContent = secs.toString().padStart(2, '0');

    // Update progress circle
    const circumference = 2 * Math.PI * 45;
    const progress = (totalSeconds - remainingSeconds) / totalSeconds;
    progressCircle.style.strokeDashoffset = circumference * (1 - progress);
  }

  function updateStats() {
    sessionsCountEl.textContent = sessions;
    const hours = Math.floor(totalMinutesWorked / 60);
    const mins = totalMinutesWorked % 60;
    totalTimeEl.textContent = `${hours}h ${mins}m`;
  }

  function startTimer() {
    if (isRunning) {
      // Pause
      clearInterval(intervalId);
      isRunning = false;
      startBtn.textContent = 'Resume';
      timerCircle.classList.remove('running');
    } else {
      // Start/Resume
      isRunning = true;
      startBtn.textContent = 'Pause';
      timerCircle.classList.add('running');

      intervalId = setInterval(() => {
        remainingSeconds--;
        updateDisplay();

        if (remainingSeconds <= 0) {
          clearInterval(intervalId);
          isRunning = false;
          startBtn.textContent = 'Start';
          timerCircle.classList.remove('running');

          if (currentMode === 'work') {
            sessions++;
            totalMinutesWorked += MODES.work / 60;
            chrome.storage.local.set({ sessions, totalMinutes: totalMinutesWorked });
            updateStats();
          }

          // Notify
          chrome.runtime.sendMessage({
            type: 'timerComplete',
            mode: currentMode,
            task: taskNameInput.value
          });

          // Auto-switch mode
          if (currentMode === 'work') {
            switchMode(sessions % 4 === 0 ? 'long' : 'short');
          } else {
            switchMode('work');
          }
        }
      }, 1000);
    }
  }

  function resetTimer() {
    clearInterval(intervalId);
    isRunning = false;
    remainingSeconds = totalSeconds;
    startBtn.textContent = 'Start';
    timerCircle.classList.remove('running');
    updateDisplay();
  }

  function switchMode(mode) {
    currentMode = mode;
    totalSeconds = MODES[mode];
    remainingSeconds = totalSeconds;

    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update circle color based on mode
    const colors = {
      work: '#e94560',
      short: '#4ecca3',
      long: '#7b68ee'
    };
    progressCircle.style.stroke = colors[mode];

    if (isRunning) {
      clearInterval(intervalId);
      isRunning = false;
      startBtn.textContent = 'Start';
      timerCircle.classList.remove('running');
    }

    updateDisplay();
  }

  // Event listeners
  startBtn.addEventListener('click', startTimer);
  resetBtn.addEventListener('click', resetTimer);

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Initialize display
  updateDisplay();
});
