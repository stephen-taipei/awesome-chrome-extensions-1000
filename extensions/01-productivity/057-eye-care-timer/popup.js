// Eye Care Timer - Popup Script

class EyeCareTimer {
  constructor() {
    this.settings = {
      enabled: true,
      interval: 20,
      nextRestTime: null,
      todayRests: 0,
      totalRests: 0,
      lastDate: null
    };
    this.initElements();
    this.bindEvents();
    this.loadSettings();
    this.startTimer();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.statusText = document.getElementById('statusText');
    this.eyeAnimation = document.getElementById('eyeAnimation');
    this.restNowBtn = document.getElementById('restNowBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.todayRestsEl = document.getElementById('todayRests');
    this.totalRestsEl = document.getElementById('totalRests');
    this.eyeHealthEl = document.getElementById('eyeHealth');
  }

  bindEvents() {
    this.enableToggle.addEventListener('change', () => {
      this.settings.enabled = this.enableToggle.checked;
      if (this.settings.enabled) {
        this.scheduleNextRest();
      }
      this.saveSettings();
      this.updateDisplay();
    });

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.settings.interval = parseInt(btn.dataset.minutes);
        this.scheduleNextRest();
        this.saveSettings();
      });
    });

    this.restNowBtn.addEventListener('click', () => this.takeRest());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
  }

  async loadSettings() {
    const result = await chrome.storage.local.get('eyeCareSettings');
    if (result.eyeCareSettings) {
      this.settings = { ...this.settings, ...result.eyeCareSettings };
    }

    // Check if new day
    const today = new Date().toDateString();
    if (this.settings.lastDate !== today) {
      this.settings.todayRests = 0;
      this.settings.lastDate = today;
    }

    this.updateUI();
    this.saveSettings();
  }

  async saveSettings() {
    await chrome.storage.local.set({
      eyeCareSettings: this.settings
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

    this.todayRestsEl.textContent = this.settings.todayRests;
    this.totalRestsEl.textContent = this.settings.totalRests;

    // Calculate eye health based on rest frequency
    const expectedRests = Math.floor((new Date().getHours() - 8) * 60 / this.settings.interval);
    const healthPercent = expectedRests > 0
      ? Math.min(100, Math.round((this.settings.todayRests / expectedRests) * 100))
      : 100;
    this.eyeHealthEl.textContent = `${healthPercent}%`;
  }

  updateDisplay() {
    if (!this.settings.enabled) {
      this.timerDisplay.textContent = '--:--';
      this.statusText.textContent = '護眼提醒已暫停';
      this.eyeAnimation.style.opacity = '0.3';
      return;
    }

    this.eyeAnimation.style.opacity = '1';
  }

  scheduleNextRest() {
    this.settings.nextRestTime = Date.now() + (this.settings.interval * 60 * 1000);
    this.saveSettings();
  }

  startTimer() {
    if (!this.settings.nextRestTime) {
      this.scheduleNextRest();
    }

    setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    if (!this.settings.enabled) {
      this.updateDisplay();
      return;
    }

    const now = Date.now();
    const remaining = Math.max(0, this.settings.nextRestTime - now);

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remaining > 60000) {
      this.statusText.textContent = '距離下次眼睛休息';
    } else if (remaining > 0) {
      this.statusText.textContent = '即將提醒休息！';
    } else {
      this.timerDisplay.textContent = '00:00';
      this.statusText.textContent = '該讓眼睛休息了！';
    }
  }

  async takeRest() {
    this.settings.todayRests++;
    this.settings.totalRests++;

    this.scheduleNextRest();
    await this.saveSettings();
    this.updateUI();

    chrome.runtime.sendMessage({ action: 'restTaken' });
  }

  resetTimer() {
    this.scheduleNextRest();
    this.saveSettings();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new EyeCareTimer();
});
