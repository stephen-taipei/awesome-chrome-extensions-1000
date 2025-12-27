// Break Reminder - Popup Script

class BreakReminder {
  constructor() {
    this.settings = {
      enabled: true,
      interval: 25,
      breakDuration: 5,
      activities: ['stretch', 'eyes', 'water'],
      nextBreakTime: null,
      todayBreaks: 0,
      totalBreaks: 0,
      streak: 0,
      lastDate: null
    };
    this.initElements();
    this.bindEvents();
    this.loadSettings();
    this.updateDisplay();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.statusIcon = document.getElementById('statusIcon');
    this.nextBreakEl = document.getElementById('nextBreak');
    this.progress = document.getElementById('progress');
    this.takeBreakBtn = document.getElementById('takeBreakBtn');
    this.skipBreakBtn = document.getElementById('skipBreakBtn');
    this.todayBreaksEl = document.getElementById('todayBreaks');
    this.totalBreaksEl = document.getElementById('totalBreaks');
    this.streakEl = document.getElementById('streak');
  }

  bindEvents() {
    this.enableToggle.addEventListener('change', () => {
      this.settings.enabled = this.enableToggle.checked;
      if (this.settings.enabled) {
        this.scheduleNextBreak();
      }
      this.saveSettings();
      this.updateDisplay();
    });

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.settings.interval = parseInt(btn.dataset.minutes);
        this.scheduleNextBreak();
        this.saveSettings();
      });
    });

    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.settings.breakDuration = parseInt(btn.dataset.duration);
        this.saveSettings();
      });
    });

    document.querySelectorAll('input[name="activity"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.settings.activities = Array.from(
          document.querySelectorAll('input[name="activity"]:checked')
        ).map(cb => cb.value);
        this.saveSettings();
      });
    });

    this.takeBreakBtn.addEventListener('click', () => this.takeBreak());
    this.skipBreakBtn.addEventListener('click', () => this.skipBreak());
  }

  async loadSettings() {
    const result = await chrome.storage.local.get('breakReminderSettings');
    if (result.breakReminderSettings) {
      this.settings = { ...this.settings, ...result.breakReminderSettings };
    }

    // Check if new day
    const today = new Date().toDateString();
    if (this.settings.lastDate !== today) {
      if (this.settings.lastDate && this.settings.todayBreaks > 0) {
        const lastDate = new Date(this.settings.lastDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() === yesterday.toDateString()) {
          this.settings.streak++;
        } else {
          this.settings.streak = 0;
        }
      }
      this.settings.todayBreaks = 0;
      this.settings.lastDate = today;
    }

    this.updateUI();
    this.saveSettings();
  }

  async saveSettings() {
    await chrome.storage.local.set({
      breakReminderSettings: this.settings
    });
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: this.settings
    });
  }

  updateUI() {
    this.enableToggle.checked = this.settings.enabled;

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.minutes) === this.settings.interval);
    });

    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.duration) === this.settings.breakDuration);
    });

    document.querySelectorAll('input[name="activity"]').forEach(checkbox => {
      checkbox.checked = this.settings.activities.includes(checkbox.value);
    });

    this.todayBreaksEl.textContent = this.settings.todayBreaks;
    this.totalBreaksEl.textContent = this.settings.totalBreaks;
    this.streakEl.textContent = this.settings.streak;
  }

  updateDisplay() {
    if (!this.settings.enabled) {
      this.statusIcon.textContent = '😴';
      this.nextBreakEl.textContent = '休息提醒已暫停';
      this.progress.style.width = '0%';
      return;
    }

    if (!this.settings.nextBreakTime) {
      this.scheduleNextBreak();
    }

    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    if (!this.settings.enabled || !this.settings.nextBreakTime) return;

    const now = Date.now();
    const remaining = Math.max(0, this.settings.nextBreakTime - now);
    const totalMs = this.settings.interval * 60 * 1000;

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    this.statusIcon.textContent = minutes < 5 ? '⏰' : '☕';
    this.nextBreakEl.textContent = `距離下次休息還有 ${minutes} 分 ${seconds} 秒`;

    const progress = ((totalMs - remaining) / totalMs) * 100;
    this.progress.style.width = `${progress}%`;

    if (remaining === 0) {
      this.statusIcon.textContent = '🔔';
      this.nextBreakEl.textContent = '該休息啦！';
    }
  }

  scheduleNextBreak() {
    this.settings.nextBreakTime = Date.now() + (this.settings.interval * 60 * 1000);
    this.saveSettings();
  }

  async takeBreak() {
    this.settings.todayBreaks++;
    this.settings.totalBreaks++;
    this.settings.lastDate = new Date().toDateString();

    this.scheduleNextBreak();
    await this.saveSettings();
    this.updateUI();

    chrome.runtime.sendMessage({ action: 'breakTaken' });
  }

  skipBreak() {
    this.scheduleNextBreak();
    this.saveSettings();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new BreakReminder();
});
