// Weekly Report - Popup Script

class WeeklyReport {
  constructor() {
    this.history = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.showWeekRange();
  }

  initElements() {
    this.weekRangeEl = document.getElementById('weekRange');
    this.accomplishmentsEl = document.getElementById('accomplishments');
    this.nextWeekEl = document.getElementById('nextWeek');
    this.highlightsEl = document.getElementById('highlights');
    this.challengesEl = document.getElementById('challenges');
    this.copyBtn = document.getElementById('copyReport');
    this.clearBtn = document.getElementById('clearReport');
    this.listEl = document.getElementById('historyList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyReport());
    this.clearBtn.addEventListener('click', () => this.clearReport());
  }

  getWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const format = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(monday)} - ${format(friday)}`;
  }

  showWeekRange() {
    this.weekRangeEl.textContent = this.getWeekRange();
  }

  async loadData() {
    const result = await chrome.storage.local.get('weeklyReportHistory');
    if (result.weeklyReportHistory) {
      this.history = result.weeklyReportHistory;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ weeklyReportHistory: this.history });
  }

  formatReport() {
    const accomplishments = this.accomplishmentsEl.value.trim();
    const nextWeek = this.nextWeekEl.value.trim();
    const highlights = this.highlightsEl.value.trim();
    const challenges = this.challengesEl.value.trim();
    const weekRange = this.getWeekRange();

    let text = `WEEKLY REPORT - ${weekRange}\n${'═'.repeat(35)}\n\n`;
    text += `ACCOMPLISHMENTS:\n${accomplishments || '- (none)'}\\n\n`;
    text += `NEXT WEEK PLANS:\n${nextWeek || '- (none)'}\n\n`;
    text += `HIGHLIGHTS / WINS:\n${highlights || '- (none)'}\n\n`;
    text += `CHALLENGES:\n${challenges || '- None'}\n`;
    text += `${'═'.repeat(35)}`;

    return text;
  }

  async copyReport() {
    const text = this.formatReport();
    await navigator.clipboard.writeText(text);

    // Save to history
    const weekKey = this.getWeekRange();
    const existing = this.history.findIndex(h => h.week === weekKey);

    const entry = {
      id: Date.now(),
      week: weekKey,
      accomplishments: this.accomplishmentsEl.value.trim(),
      nextWeek: this.nextWeekEl.value.trim(),
      highlights: this.highlightsEl.value.trim(),
      challenges: this.challengesEl.value.trim()
    };

    if (existing >= 0) {
      this.history[existing] = entry;
    } else {
      this.history.unshift(entry);
      if (this.history.length > 12) {
        this.history.pop();
      }
    }

    this.saveData();
    this.render();

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  clearReport() {
    this.accomplishmentsEl.value = '';
    this.nextWeekEl.value = '';
    this.highlightsEl.value = '';
    this.challengesEl.value = '';
  }

  loadFromHistory(id) {
    const entry = this.history.find(h => h.id === id);
    if (entry) {
      this.accomplishmentsEl.value = entry.accomplishments;
      this.nextWeekEl.value = entry.nextWeek;
      this.highlightsEl.value = entry.highlights;
      this.challengesEl.value = entry.challenges;
    }
  }

  deleteFromHistory(id) {
    this.history = this.history.filter(h => h.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.history.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved reports</div>';
      return;
    }

    this.listEl.innerHTML = this.history.slice(0, 5).map(h => `
      <div class="history-item">
        <span class="history-week">${h.week}</span>
        <div class="history-actions">
          <button class="load-btn" data-load="${h.id}">Load</button>
          <button class="delete-btn" data-delete="${h.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadFromHistory(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteFromHistory(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new WeeklyReport());
