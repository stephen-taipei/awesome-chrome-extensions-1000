// Work Log - Popup Script

const categoryIcons = {
  development: '💻',
  meeting: '👥',
  planning: '📝',
  review: '🔍',
  research: '📚',
  admin: '📁',
  other: '📌'
};

class WorkLog {
  constructor() {
    this.data = {
      logs: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.updateDateDisplay();
  }

  initElements() {
    this.dateDisplayEl = document.getElementById('dateDisplay');
    this.todayCountEl = document.getElementById('todayCount');
    this.weekCountEl = document.getElementById('weekCount');
    this.todayHoursEl = document.getElementById('todayHours');
    this.logEntryEl = document.getElementById('logEntry');
    this.categoryEl = document.getElementById('category');
    this.durationEl = document.getElementById('duration');
    this.logBtn = document.getElementById('logBtn');
    this.logsListEl = document.getElementById('logsList');
  }

  bindEvents() {
    this.logBtn.addEventListener('click', () => this.addLog());
    this.logEntryEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) this.addLog();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('workLogData');
    if (result.workLogData) {
      this.data = result.workLogData;
    }
    this.cleanupOldLogs();
    this.updateStats();
    this.renderLogs();
  }

  async saveData() {
    await chrome.storage.local.set({ workLogData: this.data });
  }

  cleanupOldLogs() {
    // Keep last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.data.logs = this.data.logs.filter(l => l.createdAt > thirtyDaysAgo);
  }

  updateDateDisplay() {
    const now = new Date();
    this.dateDisplayEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getTodayStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).getTime();
  }

  async addLog() {
    const text = this.logEntryEl.value.trim();
    const category = this.categoryEl.value;
    const duration = parseInt(this.durationEl.value) || 0;

    if (!text) {
      this.logBtn.textContent = 'Write something!';
      setTimeout(() => {
        this.logBtn.textContent = 'Log';
      }, 1500);
      return;
    }

    const log = {
      id: this.generateId(),
      text,
      category,
      duration,
      createdAt: Date.now()
    };

    this.data.logs.unshift(log);
    await this.saveData();

    this.logEntryEl.value = '';
    this.durationEl.value = '';

    this.updateStats();
    this.renderLogs();
  }

  async deleteLog(id) {
    this.data.logs = this.data.logs.filter(l => l.id !== id);
    await this.saveData();
    this.updateStats();
    this.renderLogs();
  }

  updateStats() {
    const todayStart = this.getTodayStart();
    const weekStart = this.getWeekStart();

    const todayLogs = this.data.logs.filter(l => l.createdAt >= todayStart);
    const weekLogs = this.data.logs.filter(l => l.createdAt >= weekStart);
    const todayMinutes = todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const todayHours = Math.round(todayMinutes / 60 * 10) / 10;

    this.todayCountEl.textContent = todayLogs.length;
    this.weekCountEl.textContent = weekLogs.length;
    this.todayHoursEl.textContent = todayHours + 'h';
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  renderLogs() {
    const todayStart = this.getTodayStart();
    const todayLogs = this.data.logs.filter(l => l.createdAt >= todayStart);

    this.logsListEl.innerHTML = todayLogs.map(log => `
      <div class="log-item" data-id="${log.id}">
        <span class="log-icon">${categoryIcons[log.category]}</span>
        <div class="log-info">
          <div class="log-text">${log.text}</div>
          <div class="log-meta">
            <span>${this.formatTime(log.createdAt)}</span>
            <span>${log.category}</span>
          </div>
        </div>
        ${log.duration ? `<span class="log-duration">${log.duration}m</span>` : ''}
        <button class="log-delete">×</button>
      </div>
    `).join('');

    this.logsListEl.querySelectorAll('.log-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteLog(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new WorkLog();
});
