// Pomodoro Timer - Popup Script

class PomodoroTimer {
  constructor() {
    this.settings = {
      workTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      longBreakInterval: 4,
      autoStart: true,
      notifications: true
    };

    this.state = {
      mode: 'work', // work, shortBreak, longBreak
      isRunning: false,
      timeLeft: 25 * 60,
      totalTime: 25 * 60,
      sessionsCompleted: 0
    };

    this.stats = {
      today: { pomodoros: 0, minutes: 0, date: '' },
      total: { pomodoros: 0 }
    };

    this.initElements();
    this.loadData();
    this.bindEvents();
    this.startSync();
  }

  initElements() {
    this.modeTabs = document.querySelectorAll('.mode-tab');
    this.timerCircle = document.getElementById('timerCircle');
    this.timerProgress = document.getElementById('timerProgress');
    this.timerTime = document.getElementById('timerTime');
    this.timerMode = document.getElementById('timerMode');
    this.startBtn = document.getElementById('startBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');

    // Stats
    this.todayPomodoros = document.getElementById('todayPomodoros');
    this.todayMinutes = document.getElementById('todayMinutes');
    this.totalPomodoros = document.getElementById('totalPomodoros');
    this.sessionsTrack = document.getElementById('sessionsTrack');

    // Settings inputs
    this.workTimeInput = document.getElementById('workTime');
    this.shortBreakTimeInput = document.getElementById('shortBreakTime');
    this.longBreakTimeInput = document.getElementById('longBreakTime');
    this.longBreakIntervalInput = document.getElementById('longBreakInterval');
    this.autoStartInput = document.getElementById('autoStart');
    this.notificationsInput = document.getElementById('notifications');
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['pomodoroSettings', 'pomodoroState', 'pomodoroStats']);

      if (result.pomodoroSettings) {
        this.settings = { ...this.settings, ...result.pomodoroSettings };
      }

      if (result.pomodoroState) {
        this.state = { ...this.state, ...result.pomodoroState };
      }

      if (result.pomodoroStats) {
        this.stats = { ...this.stats, ...result.pomodoroStats };
      }

      // Check if today's stats are outdated
      const today = new Date().toDateString();
      if (this.stats.today.date !== today) {
        this.stats.today = { pomodoros: 0, minutes: 0, date: today };
      }

      this.render();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      await chrome.storage.local.set({
        pomodoroSettings: this.settings,
        pomodoroState: this.state,
        pomodoroStats: this.stats
      });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getModeLabel(mode) {
    const labels = {
      work: '專注時間',
      shortBreak: '短休息',
      longBreak: '長休息'
    };
    return labels[mode] || mode;
  }

  getModeTime(mode) {
    switch (mode) {
      case 'work': return this.settings.workTime * 60;
      case 'shortBreak': return this.settings.shortBreakTime * 60;
      case 'longBreak': return this.settings.longBreakTime * 60;
      default: return this.settings.workTime * 60;
    }
  }

  updateProgress() {
    const progress = this.state.timeLeft / this.state.totalTime;
    const dashOffset = 283 * (1 - progress);
    this.timerProgress.style.strokeDashoffset = dashOffset;
  }

  render() {
    // Update timer display
    this.timerTime.textContent = this.formatTime(this.state.timeLeft);
    this.timerMode.textContent = this.getModeLabel(this.state.mode);
    this.updateProgress();

    // Update circle color based on mode
    this.timerCircle.classList.toggle('break', this.state.mode !== 'work');

    // Update mode tabs
    this.modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === this.state.mode);
    });

    // Update start button
    if (this.state.isRunning) {
      this.startBtn.textContent = '⏸ 暫停';
      this.startBtn.classList.add('running');
    } else {
      this.startBtn.textContent = '▶ 開始';
      this.startBtn.classList.remove('running');
    }

    // Update stats
    this.todayPomodoros.textContent = this.stats.today.pomodoros;
    this.todayMinutes.textContent = this.stats.today.minutes;
    this.totalPomodoros.textContent = this.stats.total.pomodoros;

    // Render sessions track
    this.renderSessionsTrack();
  }

  renderSessionsTrack() {
    const completed = this.stats.today.pomodoros;
    const current = this.state.mode === 'work' && this.state.isRunning;

    let html = '';
    for (let i = 0; i < Math.max(completed + 1, 8); i++) {
      let className = 'session-dot';
      if (i < completed) {
        className += ' completed';
        html += `<div class="${className}">🍅</div>`;
      } else if (i === completed && current) {
        className += ' current';
        html += `<div class="${className}">⏱</div>`;
      } else {
        html += `<div class="${className}"></div>`;
      }
    }
    this.sessionsTrack.innerHTML = html;
  }

  setMode(mode) {
    if (this.state.isRunning) {
      if (!confirm('切換模式將重置計時器，確定繼續？')) {
        return;
      }
      this.stop();
    }

    this.state.mode = mode;
    this.state.timeLeft = this.getModeTime(mode);
    this.state.totalTime = this.state.timeLeft;
    this.saveData();
    this.render();
  }

  start() {
    if (this.state.isRunning) {
      this.pause();
    } else {
      this.resume();
    }
  }

  resume() {
    this.state.isRunning = true;
    this.saveData();
    this.render();

    // Send message to background to start timer
    chrome.runtime.sendMessage({ type: 'startTimer' });
  }

  pause() {
    this.state.isRunning = false;
    this.saveData();
    this.render();

    // Send message to background to pause timer
    chrome.runtime.sendMessage({ type: 'pauseTimer' });
  }

  stop() {
    this.state.isRunning = false;
    chrome.runtime.sendMessage({ type: 'stopTimer' });
  }

  reset() {
    this.stop();
    this.state.timeLeft = this.getModeTime(this.state.mode);
    this.state.totalTime = this.state.timeLeft;
    this.saveData();
    this.render();
  }

  showSettings() {
    this.workTimeInput.value = this.settings.workTime;
    this.shortBreakTimeInput.value = this.settings.shortBreakTime;
    this.longBreakTimeInput.value = this.settings.longBreakTime;
    this.longBreakIntervalInput.value = this.settings.longBreakInterval;
    this.autoStartInput.checked = this.settings.autoStart;
    this.notificationsInput.checked = this.settings.notifications;
    this.settingsModal.classList.remove('hidden');
  }

  hideSettings() {
    this.settingsModal.classList.add('hidden');
  }

  saveSettings() {
    this.settings.workTime = parseInt(this.workTimeInput.value) || 25;
    this.settings.shortBreakTime = parseInt(this.shortBreakTimeInput.value) || 5;
    this.settings.longBreakTime = parseInt(this.longBreakTimeInput.value) || 15;
    this.settings.longBreakInterval = parseInt(this.longBreakIntervalInput.value) || 4;
    this.settings.autoStart = this.autoStartInput.checked;
    this.settings.notifications = this.notificationsInput.checked;

    // Update current timer if not running
    if (!this.state.isRunning) {
      this.state.timeLeft = this.getModeTime(this.state.mode);
      this.state.totalTime = this.state.timeLeft;
    }

    this.saveData();
    this.hideSettings();
    this.render();
  }

  startSync() {
    // Sync state with background every second
    this.syncInterval = setInterval(async () => {
      try {
        const result = await chrome.storage.local.get(['pomodoroState', 'pomodoroStats']);
        if (result.pomodoroState) {
          this.state = { ...this.state, ...result.pomodoroState };
        }
        if (result.pomodoroStats) {
          const today = new Date().toDateString();
          if (result.pomodoroStats.today.date === today) {
            this.stats = result.pomodoroStats;
          }
        }
        this.render();
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, 1000);
  }

  bindEvents() {
    // Mode tabs
    this.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => this.setMode(tab.dataset.mode));
    });

    // Control buttons
    this.startBtn.addEventListener('click', () => this.start());
    this.resetBtn.addEventListener('click', () => this.reset());

    // Settings
    this.settingsBtn.addEventListener('click', () => this.showSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
    this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.hideSettings();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideSettings();
      if (e.key === ' ' && !this.settingsModal.classList.contains('hidden')) return;
      if (e.key === ' ') {
        e.preventDefault();
        this.start();
      }
    });

    // Cleanup on popup close
    window.addEventListener('unload', () => {
      clearInterval(this.syncInterval);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PomodoroTimer();
});
