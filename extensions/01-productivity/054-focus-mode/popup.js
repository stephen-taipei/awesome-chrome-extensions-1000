// Focus Mode - Popup Script

class FocusMode {
  constructor() {
    this.isActive = false;
    this.selectedMinutes = 25;
    this.endTime = null;
    this.blockedSites = [];
    this.stats = { todaySessions: 0, todayMinutes: 0, streak: 0 };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.updateTimer();
  }

  initElements() {
    this.timerSection = document.getElementById('timerSection');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.statusText = document.getElementById('statusText');
    this.durationSection = document.getElementById('durationSection');
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.blockedSitesContainer = document.getElementById('blockedSites');
    this.addSiteBtn = document.getElementById('addSiteBtn');
    this.addSiteForm = document.getElementById('addSiteForm');
    this.siteInput = document.getElementById('siteInput');
    this.saveSiteBtn = document.getElementById('saveSiteBtn');
    this.todaySessionsEl = document.getElementById('todaySessions');
    this.todayMinutesEl = document.getElementById('todayMinutes');
    this.streakEl = document.getElementById('streak');
  }

  bindEvents() {
    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isActive) return;
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMinutes = parseInt(btn.dataset.minutes);
        this.timerDisplay.textContent = this.formatTime(this.selectedMinutes * 60);
      });
    });

    this.startBtn.addEventListener('click', () => this.startFocus());
    this.stopBtn.addEventListener('click', () => this.stopFocus());
    this.addSiteBtn.addEventListener('click', () => this.toggleAddForm());
    this.saveSiteBtn.addEventListener('click', () => this.addSite());
    this.siteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSite();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get(['focusState', 'blockedSites', 'focusStats']);

    this.blockedSites = result.blockedSites || [
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'youtube.com',
      'tiktok.com'
    ];

    this.stats = result.focusStats || { todaySessions: 0, todayMinutes: 0, streak: 0, lastDate: null };

    // Check if stats are from today
    const today = new Date().toDateString();
    if (this.stats.lastDate !== today) {
      if (this.stats.lastDate) {
        const lastDate = new Date(this.stats.lastDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() !== yesterday.toDateString()) {
          this.stats.streak = 0;
        }
      }
      this.stats.todaySessions = 0;
      this.stats.todayMinutes = 0;
    }

    // Check if focus is active
    if (result.focusState) {
      const state = result.focusState;
      if (state.isActive && state.endTime > Date.now()) {
        this.isActive = true;
        this.endTime = state.endTime;
        this.selectedMinutes = state.duration;
        this.updateUIForActiveState();
      }
    }

    this.renderBlockedSites();
    this.renderStats();
  }

  async saveData() {
    await chrome.storage.local.set({
      blockedSites: this.blockedSites,
      focusStats: this.stats
    });
  }

  async saveFocusState() {
    await chrome.storage.local.set({
      focusState: {
        isActive: this.isActive,
        endTime: this.endTime,
        duration: this.selectedMinutes
      }
    });
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateTimer() {
    if (this.isActive && this.endTime) {
      const remaining = Math.max(0, Math.floor((this.endTime - Date.now()) / 1000));
      this.timerDisplay.textContent = this.formatTime(remaining);

      if (remaining === 0) {
        this.completeFocus();
      }
    }

    setTimeout(() => this.updateTimer(), 1000);
  }

  updateUIForActiveState() {
    this.timerSection.classList.add('active');
    this.statusText.textContent = '專注中...保持專注！';
    this.startBtn.classList.add('hidden');
    this.stopBtn.classList.remove('hidden');
    this.durationSection.style.opacity = '0.5';
    this.durationSection.style.pointerEvents = 'none';
  }

  updateUIForInactiveState() {
    this.timerSection.classList.remove('active');
    this.statusText.textContent = '準備開始專注';
    this.startBtn.classList.remove('hidden');
    this.stopBtn.classList.add('hidden');
    this.durationSection.style.opacity = '1';
    this.durationSection.style.pointerEvents = 'auto';
    this.timerDisplay.textContent = this.formatTime(this.selectedMinutes * 60);
  }

  async startFocus() {
    this.isActive = true;
    this.endTime = Date.now() + (this.selectedMinutes * 60 * 1000);

    this.updateUIForActiveState();
    await this.saveFocusState();

    // Notify background to start blocking
    chrome.runtime.sendMessage({
      action: 'startFocus',
      blockedSites: this.blockedSites,
      duration: this.selectedMinutes
    });
  }

  async stopFocus() {
    this.isActive = false;
    this.endTime = null;

    this.updateUIForInactiveState();
    await this.saveFocusState();

    chrome.runtime.sendMessage({ action: 'stopFocus' });
  }

  async completeFocus() {
    this.isActive = false;
    this.endTime = null;

    // Update stats
    const today = new Date().toDateString();
    if (this.stats.lastDate !== today) {
      this.stats.streak++;
    }
    this.stats.todaySessions++;
    this.stats.todayMinutes += this.selectedMinutes;
    this.stats.lastDate = today;

    this.updateUIForInactiveState();
    this.renderStats();
    await this.saveData();
    await this.saveFocusState();

    chrome.runtime.sendMessage({ action: 'completeFocus' });
  }

  toggleAddForm() {
    this.addSiteForm.classList.toggle('hidden');
    if (!this.addSiteForm.classList.contains('hidden')) {
      this.siteInput.focus();
    }
  }

  async addSite() {
    let site = this.siteInput.value.trim().toLowerCase();
    if (!site) return;

    // Clean up URL
    site = site.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');

    if (!this.blockedSites.includes(site)) {
      this.blockedSites.push(site);
      await this.saveData();
      this.renderBlockedSites();
    }

    this.siteInput.value = '';
    this.addSiteForm.classList.add('hidden');
  }

  async removeSite(site) {
    this.blockedSites = this.blockedSites.filter(s => s !== site);
    await this.saveData();
    this.renderBlockedSites();
  }

  renderBlockedSites() {
    this.blockedSitesContainer.innerHTML = '';

    this.blockedSites.forEach(site => {
      const tag = document.createElement('div');
      tag.className = 'site-tag';
      tag.innerHTML = `
        <span>${site}</span>
        <button class="remove" data-site="${site}">×</button>
      `;

      tag.querySelector('.remove').addEventListener('click', () => {
        this.removeSite(site);
      });

      this.blockedSitesContainer.appendChild(tag);
    });
  }

  renderStats() {
    this.todaySessionsEl.textContent = this.stats.todaySessions;
    this.todayMinutesEl.textContent = this.stats.todayMinutes;
    this.streakEl.textContent = this.stats.streak;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new FocusMode();
});
