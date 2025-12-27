// Break Reminder - Popup Script

const SUGGESTIONS = [
  { icon: '👀', title: '20-20-20 護眼', desc: '看向 20 呎外 20 秒' },
  { icon: '🧘', title: '深呼吸', desc: '做 5 次深呼吸放鬆' },
  { icon: '💪', title: '伸展手臂', desc: '伸展雙臂和肩膀' },
  { icon: '🚶', title: '起身走動', desc: '走動一下活動筋骨' },
  { icon: '💧', title: '喝水', desc: '補充水分保持精力' },
  { icon: '🙆', title: '轉動脖子', desc: '緩慢轉動脖子放鬆' },
  { icon: '✋', title: '活動手指', desc: '伸展和活動手指關節' },
  { icon: '🌳', title: '看看窗外', desc: '看看綠色植物休息眼睛' }
];

class BreakReminder {
  constructor() {
    this.settings = {
      interval: 30, // minutes
      duration: 60, // seconds
      isPaused: false
    };

    this.state = {
      nextBreakTime: 0,
      isOnBreak: false
    };

    this.stats = {
      todayBreaks: 0,
      todayMinutes: 0,
      skippedBreaks: 0,
      date: ''
    };

    this.initElements();
    this.loadData();
    this.bindEvents();
    this.startSync();
    this.showRandomSuggestion();
  }

  initElements() {
    this.toggleBtn = document.getElementById('toggleBtn');
    this.countdown = document.getElementById('countdown');
    this.progressFill = document.getElementById('progressFill');
    this.breakNowBtn = document.getElementById('breakNowBtn');
    this.intervalBtns = document.querySelectorAll('.interval-btn');
    this.durationBtns = document.querySelectorAll('.duration-btn');
    this.suggestionCard = document.getElementById('suggestionCard');

    this.todayBreaksEl = document.getElementById('todayBreaks');
    this.todayMinutesEl = document.getElementById('todayMinutes');
    this.skippedBreaksEl = document.getElementById('skippedBreaks');
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['breakReminderSettings', 'breakReminderState', 'breakReminderStats']);

      if (result.breakReminderSettings) {
        this.settings = { ...this.settings, ...result.breakReminderSettings };
      }

      if (result.breakReminderState) {
        this.state = { ...this.state, ...result.breakReminderState };
      }

      if (result.breakReminderStats) {
        this.stats = { ...this.stats, ...result.breakReminderStats };
      }

      // Check if stats are from today
      const today = new Date().toDateString();
      if (this.stats.date !== today) {
        this.stats = {
          todayBreaks: 0,
          todayMinutes: 0,
          skippedBreaks: 0,
          date: today
        };
        this.saveData();
      }

      this.render();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      await chrome.storage.local.set({
        breakReminderSettings: this.settings,
        breakReminderState: this.state,
        breakReminderStats: this.stats
      });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  formatTime(seconds) {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  render() {
    // Update toggle button
    this.toggleBtn.textContent = this.settings.isPaused ? '▶' : '⏸';
    this.toggleBtn.classList.toggle('paused', this.settings.isPaused);
    this.toggleBtn.title = this.settings.isPaused ? '繼續' : '暫停';

    // Update countdown
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((this.state.nextBreakTime - now) / 1000));
    this.countdown.textContent = this.formatTime(remaining);

    // Update progress
    const totalSeconds = this.settings.interval * 60;
    const elapsed = totalSeconds - remaining;
    const progress = (elapsed / totalSeconds) * 100;
    this.progressFill.style.width = `${Math.min(100, progress)}%`;

    // Update interval buttons
    this.intervalBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.minutes) === this.settings.interval);
    });

    // Update duration buttons
    this.durationBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.seconds) === this.settings.duration);
    });

    // Update stats
    this.todayBreaksEl.textContent = this.stats.todayBreaks;
    this.todayMinutesEl.textContent = this.stats.todayMinutes;
    this.skippedBreaksEl.textContent = this.stats.skippedBreaks;
  }

  showRandomSuggestion() {
    const suggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
    this.suggestionCard.innerHTML = `
      <div class="suggestion-icon">${suggestion.icon}</div>
      <div class="suggestion-text">
        <div class="suggestion-title">${suggestion.title}</div>
        <div class="suggestion-desc">${suggestion.desc}</div>
      </div>
    `;
  }

  togglePause() {
    this.settings.isPaused = !this.settings.isPaused;

    if (!this.settings.isPaused) {
      // Resuming - set new break time
      this.state.nextBreakTime = Date.now() + this.settings.interval * 60 * 1000;
    }

    this.saveData();
    this.render();

    // Notify background
    chrome.runtime.sendMessage({
      type: this.settings.isPaused ? 'pauseReminder' : 'resumeReminder'
    });
  }

  setInterval(minutes) {
    this.settings.interval = minutes;
    this.state.nextBreakTime = Date.now() + minutes * 60 * 1000;
    this.saveData();
    this.render();

    chrome.runtime.sendMessage({ type: 'updateInterval', minutes });
  }

  setDuration(seconds) {
    this.settings.duration = seconds;
    this.saveData();
    this.render();
  }

  takeBreakNow() {
    // Record the break
    this.stats.todayBreaks++;
    this.stats.todayMinutes += Math.ceil(this.settings.duration / 60);

    // Reset timer for next break
    this.state.nextBreakTime = Date.now() + this.settings.interval * 60 * 1000;

    this.saveData();
    this.render();

    // Notify background
    chrome.runtime.sendMessage({ type: 'breakTaken' });

    // Show new suggestion
    this.showRandomSuggestion();
  }

  startSync() {
    this.syncInterval = setInterval(async () => {
      const result = await chrome.storage.local.get(['breakReminderState', 'breakReminderStats']);

      if (result.breakReminderState) {
        this.state = result.breakReminderState;
      }

      if (result.breakReminderStats) {
        this.stats = result.breakReminderStats;
      }

      this.render();
    }, 1000);
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.togglePause());
    this.breakNowBtn.addEventListener('click', () => this.takeBreakNow());

    this.intervalBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setInterval(parseInt(btn.dataset.minutes)));
    });

    this.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setDuration(parseInt(btn.dataset.seconds)));
    });

    this.suggestionCard.addEventListener('click', () => this.showRandomSuggestion());

    window.addEventListener('unload', () => {
      clearInterval(this.syncInterval);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BreakReminder();
});
