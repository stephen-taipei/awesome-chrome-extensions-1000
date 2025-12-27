// Simple Timer - Popup Script

class SimpleTimer {
  constructor() {
    this.timers = [];

    this.initElements();
    this.loadTimers();
    this.bindEvents();
    this.startSync();
  }

  initElements() {
    this.presetBtns = document.querySelectorAll('.preset-btn');
    this.hoursInput = document.getElementById('hoursInput');
    this.minutesInput = document.getElementById('minutesInput');
    this.secondsInput = document.getElementById('secondsInput');
    this.timerLabel = document.getElementById('timerLabel');
    this.addTimerBtn = document.getElementById('addTimerBtn');
    this.timersList = document.getElementById('timersList');
    this.timerCount = document.getElementById('timerCount');
  }

  async loadTimers() {
    try {
      const result = await chrome.storage.local.get(['simpleTimers']);
      this.timers = result.simpleTimers || [];
      this.render();
    } catch (error) {
      console.error('Failed to load timers:', error);
    }
  }

  async saveTimers() {
    try {
      await chrome.storage.local.set({ simpleTimers: this.timers });
    } catch (error) {
      console.error('Failed to save timers:', error);
    }
  }

  formatTime(seconds) {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  render() {
    // Update counter
    const activeCount = this.timers.filter(t => t.isRunning).length;
    this.timerCount.textContent = this.timers.length;

    if (this.timers.length === 0) {
      this.timersList.innerHTML = `
        <div class="empty-state">
          <p>📭 尚無計時器</p>
          <p>選擇預設時間或自訂</p>
        </div>
      `;
      return;
    }

    this.timersList.innerHTML = this.timers.map(timer => {
      const isFinished = timer.timeLeft <= 0;
      const statusClass = isFinished ? 'finished' : (timer.isRunning ? '' : 'paused');

      return `
        <div class="timer-item ${statusClass}" data-id="${timer.id}">
          <div class="timer-info">
            <div class="timer-label">${timer.label || '計時器'}</div>
            <div class="timer-time">${this.formatTime(timer.timeLeft)}</div>
          </div>
          <div class="timer-controls">
            ${isFinished ? '' : `
              <button class="timer-btn ${timer.isRunning ? 'pause' : 'play'}" data-action="toggle">
                ${timer.isRunning ? '⏸' : '▶'}
              </button>
            `}
            <button class="timer-btn delete" data-action="delete">×</button>
          </div>
        </div>
      `;
    }).join('');
  }

  addTimer(totalSeconds, label = '') {
    if (totalSeconds <= 0) return;

    const timer = {
      id: Date.now().toString(),
      label: label || `${Math.ceil(totalSeconds / 60)} 分鐘計時`,
      totalTime: totalSeconds,
      timeLeft: totalSeconds,
      isRunning: true,
      createdAt: Date.now()
    };

    this.timers.unshift(timer);
    this.saveTimers();
    this.render();

    // Notify background to start this timer
    chrome.runtime.sendMessage({
      type: 'startTimer',
      timerId: timer.id
    });
  }

  addCustomTimer() {
    const hours = parseInt(this.hoursInput.value) || 0;
    const minutes = parseInt(this.minutesInput.value) || 0;
    const seconds = parseInt(this.secondsInput.value) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const label = this.timerLabel.value.trim();

    if (totalSeconds <= 0) {
      alert('請輸入有效的時間');
      return;
    }

    this.addTimer(totalSeconds, label);

    // Reset inputs
    this.hoursInput.value = '0';
    this.minutesInput.value = '5';
    this.secondsInput.value = '0';
    this.timerLabel.value = '';
  }

  toggleTimer(timerId) {
    const timer = this.timers.find(t => t.id === timerId);
    if (!timer) return;

    timer.isRunning = !timer.isRunning;
    this.saveTimers();
    this.render();

    chrome.runtime.sendMessage({
      type: timer.isRunning ? 'resumeTimer' : 'pauseTimer',
      timerId: timerId
    });
  }

  deleteTimer(timerId) {
    this.timers = this.timers.filter(t => t.id !== timerId);
    this.saveTimers();
    this.render();

    chrome.runtime.sendMessage({
      type: 'deleteTimer',
      timerId: timerId
    });
  }

  startSync() {
    // Sync with storage every second
    this.syncInterval = setInterval(async () => {
      await this.loadTimers();
    }, 1000);
  }

  bindEvents() {
    // Preset buttons
    this.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes);
        this.addTimer(minutes * 60, `${minutes} 分鐘計時`);
      });
    });

    // Add custom timer
    this.addTimerBtn.addEventListener('click', () => this.addCustomTimer());

    // Enter key on inputs
    [this.hoursInput, this.minutesInput, this.secondsInput, this.timerLabel].forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.addCustomTimer();
      });
    });

    // Timer list actions
    this.timersList.addEventListener('click', (e) => {
      const btn = e.target.closest('.timer-btn');
      if (!btn) return;

      const item = btn.closest('.timer-item');
      const timerId = item.dataset.id;
      const action = btn.dataset.action;

      if (action === 'toggle') {
        this.toggleTimer(timerId);
      } else if (action === 'delete') {
        this.deleteTimer(timerId);
      }
    });

    // Cleanup on popup close
    window.addEventListener('unload', () => {
      clearInterval(this.syncInterval);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SimpleTimer();
});
