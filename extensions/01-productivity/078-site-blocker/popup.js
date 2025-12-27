// Site Blocker - Popup Script

class SiteBlocker {
  constructor() {
    this.data = {
      enabled: true,
      sites: [],
      schedule: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00'
      }
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.blockCurrentBtn = document.getElementById('blockCurrentBtn');
    this.siteInput = document.getElementById('siteInput');
    this.addBtn = document.getElementById('addBtn');
    this.sitesList = document.getElementById('sitesList');
    this.startTimeInput = document.getElementById('startTime');
    this.endTimeInput = document.getElementById('endTime');
    this.scheduleEnabled = document.getElementById('scheduleEnabled');
  }

  bindEvents() {
    this.enableToggle.addEventListener('change', () => this.toggleEnabled());
    this.blockCurrentBtn.addEventListener('click', () => this.blockCurrentSite());
    this.addBtn.addEventListener('click', () => this.addSite());
    this.siteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSite();
    });
    this.startTimeInput.addEventListener('change', () => this.updateSchedule());
    this.endTimeInput.addEventListener('change', () => this.updateSchedule());
    this.scheduleEnabled.addEventListener('change', () => this.updateSchedule());
  }

  async loadData() {
    const result = await chrome.storage.local.get('siteBlockerData');
    if (result.siteBlockerData) {
      this.data = result.siteBlockerData;
    }
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ siteBlockerData: this.data });
  }

  updateUI() {
    this.enableToggle.checked = this.data.enabled;
    this.startTimeInput.value = this.data.schedule.startTime;
    this.endTimeInput.value = this.data.schedule.endTime;
    this.scheduleEnabled.checked = this.data.schedule.enabled;
    this.renderSites();
  }

  async toggleEnabled() {
    this.data.enabled = this.enableToggle.checked;
    await this.saveData();
  }

  extractDomain(input) {
    let domain = input.toLowerCase().trim();

    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, '');
    // Remove www. if present
    domain = domain.replace(/^www\./, '');
    // Remove path if present
    domain = domain.split('/')[0];

    return domain;
  }

  async blockCurrentSite() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname.replace('www.', '');

        if (!this.data.sites.includes(domain)) {
          this.data.sites.push(domain);
          await this.saveData();
          this.renderSites();

          this.blockCurrentBtn.textContent = '已封鎖 ✓';
          setTimeout(() => {
            this.blockCurrentBtn.textContent = '封鎖當前網站';
          }, 1500);
        } else {
          this.blockCurrentBtn.textContent = '已在列表中';
          setTimeout(() => {
            this.blockCurrentBtn.textContent = '封鎖當前網站';
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Failed to get current site:', err);
    }
  }

  async addSite() {
    const domain = this.extractDomain(this.siteInput.value);
    if (!domain) return;

    if (this.data.sites.includes(domain)) {
      return;
    }

    this.data.sites.push(domain);
    await this.saveData();

    this.siteInput.value = '';
    this.renderSites();
  }

  async removeSite(domain) {
    this.data.sites = this.data.sites.filter(s => s !== domain);
    await this.saveData();
    this.renderSites();
  }

  async updateSchedule() {
    this.data.schedule = {
      enabled: this.scheduleEnabled.checked,
      startTime: this.startTimeInput.value,
      endTime: this.endTimeInput.value
    };
    await this.saveData();
  }

  renderSites() {
    this.sitesList.innerHTML = this.data.sites.map(domain => `
      <div class="site-item" data-domain="${domain}">
        <span class="site-domain">${domain}</span>
        <button class="site-remove">×</button>
      </div>
    `).join('');

    this.sitesList.querySelectorAll('.site-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const domain = btn.parentElement.dataset.domain;
        this.removeSite(domain);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new SiteBlocker();
});
