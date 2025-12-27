// Standup Notes - Popup Script

class StandupNotes {
  constructor() {
    this.history = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.showDate();
  }

  initElements() {
    this.dateEl = document.getElementById('todayDate');
    this.yesterdayEl = document.getElementById('yesterday');
    this.todayEl = document.getElementById('today');
    this.blockersEl = document.getElementById('blockers');
    this.copyBtn = document.getElementById('copyNotes');
    this.clearBtn = document.getElementById('clearNotes');
    this.listEl = document.getElementById('historyList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyNotes());
    this.clearBtn.addEventListener('click', () => this.clearNotes());
  }

  showDate() {
    const today = new Date();
    this.dateEl.textContent = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('standupHistory');
    if (result.standupHistory) {
      this.history = result.standupHistory;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ standupHistory: this.history });
  }

  formatNotes() {
    const yesterday = this.yesterdayEl.value.trim();
    const today = this.todayEl.value.trim();
    const blockers = this.blockersEl.value.trim();
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    let text = `STANDUP - ${date}\n${'─'.repeat(30)}\n\n`;
    text += `YESTERDAY:\n${yesterday || '- (none)'}\n\n`;
    text += `TODAY:\n${today || '- (none)'}\n\n`;
    text += `BLOCKERS:\n${blockers || '- None'}\n`;
    text += `${'─'.repeat(30)}`;

    return text;
  }

  async copyNotes() {
    const text = this.formatNotes();
    await navigator.clipboard.writeText(text);

    // Save to history
    const dateKey = new Date().toLocaleDateString();
    const existing = this.history.findIndex(h => h.date === dateKey);

    const entry = {
      id: Date.now(),
      date: dateKey,
      yesterday: this.yesterdayEl.value.trim(),
      today: this.todayEl.value.trim(),
      blockers: this.blockersEl.value.trim()
    };

    if (existing >= 0) {
      this.history[existing] = entry;
    } else {
      this.history.unshift(entry);
      if (this.history.length > 14) {
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

  clearNotes() {
    this.yesterdayEl.value = '';
    this.todayEl.value = '';
    this.blockersEl.value = '';
  }

  loadFromHistory(id) {
    const entry = this.history.find(h => h.id === id);
    if (entry) {
      this.yesterdayEl.value = entry.yesterday;
      this.todayEl.value = entry.today;
      this.blockersEl.value = entry.blockers;
    }
  }

  deleteFromHistory(id) {
    this.history = this.history.filter(h => h.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.history.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved standups</div>';
      return;
    }

    this.listEl.innerHTML = this.history.slice(0, 7).map(h => `
      <div class="history-item">
        <span class="history-date">${h.date}</span>
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

document.addEventListener('DOMContentLoaded', () => new StandupNotes());
