// Focus Mode - Popup Script

class FocusMode {
  constructor() {
    this.state = {
      isActive: false,
      strictMode: false,
      endTime: 0,
      duration: 45
    };

    this.settings = {
      blockedSites: ['facebook.com', 'twitter.com', 'youtube.com', 'instagram.com']
    };

    this.stats = {
      todaySessions: 0,
      todayMinutes: 0,
      blockedAttempts: 0,
      date: ''
    };

    this.initElements();
    this.loadData();
    this.bindEvents();
    this.startSync();
  }

  initElements() {
    this.focusStatus = document.getElementById('focusStatus');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.timerValue = document.getElementById('timerValue');
    this.focusBtn = document.getElementById('focusBtn');
    this.durationSection = document.getElementById('durationSection');
    this.durationBtns = document.querySelectorAll('.duration-btn');
    this.strictModeInput = document.getElementById('strictMode');

    this.siteInput = document.getElementById('siteInput');
    this.addSiteBtn = document.getElementById('addSiteBtn');
    this.sitesList = document.getElementById('sitesList');
    this.blockedCount = document.getElementById('blockedCount');
    this.presetBtns = document.querySelectorAll('.preset-btn');

    this.todaySessions = document.getElementById('todaySessions');
    this.todayMinutes = document.getElementById('todayMinutes');
    this.blockedAttempts = document.getElementById('blockedAttempts');
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['focusModeState', 'focusModeSettings', 'focusModeStats']);

      if (result.focusModeState) {
        this.state = { ...this.state, ...result.focusModeState };
      }

      if (result.focusModeSettings) {
        this.settings = { ...this.settings, ...result.focusModeSettings };
      }

      if (result.focusModeStats) {
        this.stats = { ...this.stats, ...result.focusModeStats };
      }

      // Check if stats are from today
      const today = new Date().toDateString();
      if (this.stats.date !== today) {
        this.stats = {
          todaySessions: 0,
          todayMinutes: 0,
          blockedAttempts: 0,
          date: today
        };
      }

      // Check if focus session expired
      if (this.state.isActive && this.state.endTime <= Date.now()) {
        this.state.isActive = false;
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
        focusModeState: this.state,
        focusModeSettings: this.settings,
        focusModeStats: this.stats
      });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  formatTimeRemaining(ms) {
    if (ms <= 0) return '00:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  render() {
    // Update focus status
    if (this.state.isActive) {
      this.focusStatus.classList.add('on');
      this.focusStatus.classList.remove('off');
      this.focusStatus.querySelector('.status-icon').textContent = '🎯';
      this.focusStatus.querySelector('.status-text').textContent = '專注模式進行中';

      this.timerDisplay.classList.remove('hidden');
      const remaining = this.state.endTime - Date.now();
      this.timerValue.textContent = this.formatTimeRemaining(remaining);

      this.focusBtn.textContent = this.state.strictMode ? '🔒 嚴格模式' : '結束專注';
      this.focusBtn.classList.add('active');
      this.focusBtn.disabled = this.state.strictMode;

      this.durationSection.classList.add('hidden');
      this.strictModeInput.disabled = true;
    } else {
      this.focusStatus.classList.remove('on');
      this.focusStatus.classList.add('off');
      this.focusStatus.querySelector('.status-icon').textContent = '😴';
      this.focusStatus.querySelector('.status-text').textContent = '專注模式已關閉';

      this.timerDisplay.classList.add('hidden');

      this.focusBtn.textContent = '開始專注';
      this.focusBtn.classList.remove('active');
      this.focusBtn.disabled = false;

      this.durationSection.classList.remove('hidden');
      this.strictModeInput.disabled = false;
    }

    // Update duration buttons
    this.durationBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.minutes) === this.state.duration);
    });

    // Update strict mode
    this.strictModeInput.checked = this.state.strictMode;

    // Render blocked sites
    this.renderBlockedSites();

    // Update stats
    this.todaySessions.textContent = this.stats.todaySessions;
    this.todayMinutes.textContent = this.stats.todayMinutes;
    this.blockedAttempts.textContent = this.stats.blockedAttempts;
  }

  renderBlockedSites() {
    this.blockedCount.textContent = this.settings.blockedSites.length;

    if (this.settings.blockedSites.length === 0) {
      this.sitesList.innerHTML = '<div style="color:#888;font-size:12px;">尚未設定封鎖網站</div>';
    } else {
      this.sitesList.innerHTML = this.settings.blockedSites.map(site => `
        <div class="site-tag">
          <span>${site}</span>
          <button class="remove" data-site="${site}">×</button>
        </div>
      `).join('');
    }

    // Update preset buttons
    this.presetBtns.forEach(btn => {
      const site = btn.dataset.site;
      btn.classList.toggle('added', this.settings.blockedSites.includes(site));
    });
  }

  toggleFocus() {
    if (this.state.isActive) {
      if (this.state.strictMode) return; // Can't stop in strict mode
      this.stopFocus();
    } else {
      this.startFocus();
    }
  }

  startFocus() {
    this.state.isActive = true;
    this.state.strictMode = this.strictModeInput.checked;
    this.state.endTime = Date.now() + this.state.duration * 60 * 1000;

    this.stats.todaySessions++;

    this.saveData();
    this.render();

    // Notify background
    chrome.runtime.sendMessage({ type: 'startFocus' });
  }

  stopFocus() {
    // Calculate completed minutes
    const elapsedMs = this.state.duration * 60 * 1000 - (this.state.endTime - Date.now());
    const completedMinutes = Math.floor(elapsedMs / 60000);
    this.stats.todayMinutes += completedMinutes;

    this.state.isActive = false;
    this.state.strictMode = false;

    this.saveData();
    this.render();

    // Notify background
    chrome.runtime.sendMessage({ type: 'stopFocus' });
  }

  setDuration(minutes) {
    if (this.state.isActive) return;
    this.state.duration = minutes;
    this.render();
  }

  addSite(site) {
    site = site.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    if (!site) return;
    if (this.settings.blockedSites.includes(site)) return;

    this.settings.blockedSites.push(site);
    this.saveData();
    this.render();

    this.siteInput.value = '';
  }

  removeSite(site) {
    this.settings.blockedSites = this.settings.blockedSites.filter(s => s !== site);
    this.saveData();
    this.render();
  }

  startSync() {
    this.syncInterval = setInterval(async () => {
      if (this.state.isActive) {
        const remaining = this.state.endTime - Date.now();

        if (remaining <= 0) {
          // Session completed
          this.stats.todayMinutes += this.state.duration;
          this.state.isActive = false;
          this.state.strictMode = false;
          this.saveData();
          chrome.runtime.sendMessage({ type: 'stopFocus' });
        }

        // Update stats from storage
        const result = await chrome.storage.local.get(['focusModeStats']);
        if (result.focusModeStats) {
          this.stats = result.focusModeStats;
        }

        this.render();
      }
    }, 1000);
  }

  bindEvents() {
    // Focus button
    this.focusBtn.addEventListener('click', () => this.toggleFocus());

    // Duration buttons
    this.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setDuration(parseInt(btn.dataset.minutes)));
    });

    // Add site
    this.addSiteBtn.addEventListener('click', () => this.addSite(this.siteInput.value));
    this.siteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addSite(this.siteInput.value);
    });

    // Remove site
    this.sitesList.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove');
      if (btn) {
        this.removeSite(btn.dataset.site);
      }
    });

    // Preset buttons
    this.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const site = btn.dataset.site;
        if (this.settings.blockedSites.includes(site)) {
          this.removeSite(site);
        } else {
          this.addSite(site);
        }
      });
    });

    // Cleanup
    window.addEventListener('unload', () => {
      clearInterval(this.syncInterval);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FocusMode();
});
