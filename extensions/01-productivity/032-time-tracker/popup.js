// Time Tracker - Popup Script

const CATEGORIES = {
  social: { name: '社群媒體', color: '#e74c3c', domains: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com'] },
  video: { name: '影音娛樂', color: '#9b59b6', domains: ['youtube.com', 'netflix.com', 'twitch.tv', 'bilibili.com'] },
  news: { name: '新聞閱讀', color: '#3498db', domains: ['news.google.com', 'medium.com', 'reddit.com'] },
  work: { name: '工作效率', color: '#27ae60', domains: ['github.com', 'notion.so', 'slack.com', 'trello.com', 'docs.google.com'] },
  shopping: { name: '購物網站', color: '#f39c12', domains: ['amazon.com', 'shopee.tw', 'pchome.com.tw', 'momo.com'] },
  other: { name: '其他', color: '#95a5a6', domains: [] }
};

class TimeTracker {
  constructor() {
    this.data = {};
    this.isPaused = false;
    this.currentPeriod = 'today';

    this.initElements();
    this.loadData();
    this.bindEvents();
  }

  initElements() {
    this.toggleBtn = document.getElementById('toggleBtn');
    this.totalTime = document.getElementById('totalTime');
    this.siteCount = document.getElementById('siteCount');
    this.todayDate = document.getElementById('todayDate');
    this.periodTabs = document.querySelectorAll('.period-tab');
    this.sitesList = document.getElementById('sitesList');
    this.categoryChart = document.getElementById('categoryChart');
    this.exportBtn = document.getElementById('exportBtn');
    this.clearBtn = document.getElementById('clearBtn');

    // Set today's date
    this.todayDate.textContent = new Date().toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['timeTrackerData', 'timeTrackerPaused']);
      this.data = result.timeTrackerData || {};
      this.isPaused = result.timeTrackerPaused || false;
      this.updateToggleBtn();
      this.render();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  getDateKey(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  getWeekDates() {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(this.getDateKey(date));
    }
    return dates;
  }

  getMonthDates() {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(this.getDateKey(new Date(year, month, i)));
    }
    return dates;
  }

  getPeriodData() {
    let dates = [];
    switch (this.currentPeriod) {
      case 'today':
        dates = [this.getDateKey()];
        break;
      case 'week':
        dates = this.getWeekDates();
        break;
      case 'month':
        dates = this.getMonthDates();
        break;
    }

    // Aggregate data for the period
    const aggregated = {};
    dates.forEach(dateKey => {
      const dayData = this.data[dateKey] || {};
      Object.entries(dayData).forEach(([domain, seconds]) => {
        aggregated[domain] = (aggregated[domain] || 0) + seconds;
      });
    });

    return aggregated;
  }

  formatTime(seconds) {
    if (seconds < 60) return '< 1m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatTotalTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  getDomainCategory(domain) {
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      if (cat.domains.some(d => domain.includes(d))) {
        return key;
      }
    }
    return 'other';
  }

  getFavicon(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  }

  render() {
    const periodData = this.getPeriodData();
    const entries = Object.entries(periodData).sort((a, b) => b[1] - a[1]);
    const totalSeconds = entries.reduce((sum, [, seconds]) => sum + seconds, 0);

    // Update summary
    this.totalTime.textContent = this.formatTotalTime(totalSeconds);
    this.siteCount.textContent = `${entries.length} 個網站`;

    // Render sites list
    if (entries.length === 0) {
      this.sitesList.innerHTML = '<div class="empty-state">尚無瀏覽記錄</div>';
    } else {
      const maxTime = entries[0]?.[1] || 1;
      this.sitesList.innerHTML = entries.slice(0, 10).map(([domain, seconds]) => `
        <div class="site-item">
          <img class="site-icon" src="${this.getFavicon(domain)}" alt="" onerror="this.textContent='🌐'">
          <div class="site-info">
            <div class="site-name">${domain}</div>
            <div class="site-bar">
              <div class="site-bar-fill" style="width: ${(seconds / maxTime * 100)}%"></div>
            </div>
          </div>
          <div class="site-time">${this.formatTime(seconds)}</div>
        </div>
      `).join('');
    }

    // Render category chart
    this.renderCategoryChart(entries, totalSeconds);
  }

  renderCategoryChart(entries, totalSeconds) {
    if (totalSeconds === 0) {
      this.categoryChart.innerHTML = '<div class="empty-state">尚無數據</div>';
      return;
    }

    // Aggregate by category
    const categoryData = {};
    entries.forEach(([domain, seconds]) => {
      const category = this.getDomainCategory(domain);
      categoryData[category] = (categoryData[category] || 0) + seconds;
    });

    const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);

    this.categoryChart.innerHTML = sortedCategories.map(([key, seconds]) => {
      const cat = CATEGORIES[key];
      const percent = Math.round((seconds / totalSeconds) * 100);
      return `
        <div class="category-item">
          <div class="category-color" style="background: ${cat.color}"></div>
          <div class="category-name">${cat.name}</div>
          <div class="category-percent">${percent}%</div>
          <div class="category-bar">
            <div class="category-bar-fill" style="width: ${percent}%; background: ${cat.color}"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateToggleBtn() {
    this.toggleBtn.textContent = this.isPaused ? '▶' : '⏸';
    this.toggleBtn.classList.toggle('paused', this.isPaused);
    this.toggleBtn.title = this.isPaused ? '繼續追蹤' : '暫停追蹤';
  }

  async toggleTracking() {
    this.isPaused = !this.isPaused;
    await chrome.storage.local.set({ timeTrackerPaused: this.isPaused });
    this.updateToggleBtn();

    // Notify background
    chrome.runtime.sendMessage({
      type: 'toggleTracking',
      paused: this.isPaused
    });
  }

  switchPeriod(period) {
    this.currentPeriod = period;
    this.periodTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.period === period);
    });
    this.render();
  }

  async exportReport() {
    const periodData = this.getPeriodData();
    const entries = Object.entries(periodData).sort((a, b) => b[1] - a[1]);

    let csv = 'Domain,Category,Time (seconds),Time (formatted)\n';
    entries.forEach(([domain, seconds]) => {
      const category = CATEGORIES[this.getDomainCategory(domain)].name;
      csv += `"${domain}","${category}",${seconds},"${this.formatTime(seconds)}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracker-${this.currentPeriod}-${this.getDateKey()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async clearData() {
    if (!confirm('確定要清除所有瀏覽記錄嗎？此操作無法復原。')) return;

    this.data = {};
    await chrome.storage.local.set({ timeTrackerData: {} });
    this.render();
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggleTracking());

    this.periodTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchPeriod(tab.dataset.period));
    });

    this.exportBtn.addEventListener('click', () => this.exportReport());
    this.clearBtn.addEventListener('click', () => this.clearData());

    // Refresh data periodically
    setInterval(() => this.loadData(), 5000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TimeTracker();
});
