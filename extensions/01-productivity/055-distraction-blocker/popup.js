// Distraction Blocker - Popup Script

class DistractionBlocker {
  constructor() {
    this.settings = {
      enabled: true,
      strictMode: false,
      scheduleEnabled: false,
      startTime: '09:00',
      endTime: '17:00',
      activeDays: [1, 2, 3, 4, 5],
      blockedSites: [],
      blockedToday: 0,
      lastResetDate: null
    };
    this.initElements();
    this.bindEvents();
    this.loadSettings();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.scheduleToggle = document.getElementById('scheduleToggle');
    this.strictToggle = document.getElementById('strictToggle');
    this.scheduleSettings = document.getElementById('scheduleSettings');
    this.startTime = document.getElementById('startTime');
    this.endTime = document.getElementById('endTime');
    this.addSiteBtn = document.getElementById('addSiteBtn');
    this.addForm = document.getElementById('addForm');
    this.siteInput = document.getElementById('siteInput');
    this.saveBtn = document.getElementById('saveBtn');
    this.siteList = document.getElementById('siteList');
    this.blockedToday = document.getElementById('blockedToday');
    this.sitesCount = document.getElementById('sitesCount');
  }

  bindEvents() {
    this.enableToggle.addEventListener('change', () => {
      if (this.settings.strictMode && this.enableToggle.checked === false) {
        this.enableToggle.checked = true;
        alert('嚴格模式已啟用，無法停用封鎖！');
        return;
      }
      this.settings.enabled = this.enableToggle.checked;
      this.saveSettings();
    });

    this.scheduleToggle.addEventListener('change', () => {
      this.settings.scheduleEnabled = this.scheduleToggle.checked;
      this.updateScheduleUI();
      this.saveSettings();
    });

    this.strictToggle.addEventListener('change', () => {
      this.settings.strictMode = this.strictToggle.checked;
      this.saveSettings();
    });

    this.startTime.addEventListener('change', () => {
      this.settings.startTime = this.startTime.value;
      this.saveSettings();
    });

    this.endTime.addEventListener('change', () => {
      this.settings.endTime = this.endTime.value;
      this.saveSettings();
    });

    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        btn.classList.toggle('selected');
        if (this.settings.activeDays.includes(day)) {
          this.settings.activeDays = this.settings.activeDays.filter(d => d !== day);
        } else {
          this.settings.activeDays.push(day);
        }
        this.saveSettings();
      });
    });

    this.addSiteBtn.addEventListener('click', () => {
      this.addForm.classList.toggle('hidden');
      if (!this.addForm.classList.contains('hidden')) {
        this.siteInput.focus();
      }
    });

    this.saveBtn.addEventListener('click', () => this.addSite());
    this.siteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSite();
    });
  }

  async loadSettings() {
    const result = await chrome.storage.local.get('distractionBlockerSettings');
    if (result.distractionBlockerSettings) {
      this.settings = { ...this.settings, ...result.distractionBlockerSettings };
    }

    // Reset daily counter if needed
    const today = new Date().toDateString();
    if (this.settings.lastResetDate !== today) {
      this.settings.blockedToday = 0;
      this.settings.lastResetDate = today;
      await this.saveSettings();
    }

    this.updateUI();
  }

  async saveSettings() {
    await chrome.storage.local.set({
      distractionBlockerSettings: this.settings
    });
    chrome.runtime.sendMessage({ action: 'settingsUpdated', settings: this.settings });
  }

  updateUI() {
    this.enableToggle.checked = this.settings.enabled;
    this.scheduleToggle.checked = this.settings.scheduleEnabled;
    this.strictToggle.checked = this.settings.strictMode;
    this.startTime.value = this.settings.startTime;
    this.endTime.value = this.settings.endTime;
    this.blockedToday.textContent = this.settings.blockedToday;
    this.sitesCount.textContent = this.settings.blockedSites.length;

    this.updateScheduleUI();

    document.querySelectorAll('.day-btn').forEach(btn => {
      const day = parseInt(btn.dataset.day);
      btn.classList.toggle('selected', this.settings.activeDays.includes(day));
    });

    this.renderSites();
  }

  updateScheduleUI() {
    if (this.settings.scheduleEnabled) {
      this.scheduleSettings.style.display = 'flex';
    } else {
      this.scheduleSettings.style.display = 'none';
    }
  }

  async addSite() {
    let site = this.siteInput.value.trim().toLowerCase();
    if (!site) return;

    site = site.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');

    if (!this.settings.blockedSites.includes(site)) {
      this.settings.blockedSites.push(site);
      await this.saveSettings();
      this.renderSites();
      this.sitesCount.textContent = this.settings.blockedSites.length;
    }

    this.siteInput.value = '';
    this.addForm.classList.add('hidden');
  }

  async removeSite(site) {
    this.settings.blockedSites = this.settings.blockedSites.filter(s => s !== site);
    await this.saveSettings();
    this.renderSites();
    this.sitesCount.textContent = this.settings.blockedSites.length;
  }

  renderSites() {
    this.siteList.innerHTML = '';

    this.settings.blockedSites.forEach(site => {
      const item = document.createElement('div');
      item.className = 'site-item';
      item.innerHTML = `
        <div class="site-info">
          <img class="site-icon" src="https://www.google.com/s2/favicons?domain=${site}&sz=32" alt="">
          <span class="site-name">${site}</span>
        </div>
        <button class="remove-btn" data-site="${site}">×</button>
      `;

      item.querySelector('.remove-btn').addEventListener('click', () => {
        this.removeSite(site);
      });

      this.siteList.appendChild(item);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new DistractionBlocker();
});
