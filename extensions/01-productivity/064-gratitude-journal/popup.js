// Gratitude Journal - Popup Script

class GratitudeJournal {
  constructor() {
    this.data = {
      entries: [],
      streak: 0,
      lastDate: null
    };
    this.todayEntries = ['', '', ''];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.currentDateEl = document.getElementById('currentDate');
    this.entryInputs = document.querySelectorAll('.entry-input');
    this.saveBtn = document.getElementById('saveBtn');
    this.streakEl = document.getElementById('streak');
    this.totalEntriesEl = document.getElementById('totalEntries');
    this.historyList = document.getElementById('historyList');
  }

  bindEvents() {
    this.entryInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.todayEntries[parseInt(e.target.dataset.index)] = e.target.value;
        this.updateSaveButton();
      });
    });

    this.saveBtn.addEventListener('click', () => this.saveEntry());
  }

  async loadData() {
    const result = await chrome.storage.local.get('gratitudeData');
    if (result.gratitudeData) {
      this.data = { ...this.data, ...result.gratitudeData };
    }

    // Update date display
    const now = new Date();
    this.currentDateEl.textContent = now.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    });

    // Check streak
    const today = now.toDateString();
    if (this.data.lastDate) {
      const lastDate = new Date(this.data.lastDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.toDateString() !== today && lastDate.toDateString() !== yesterday.toDateString()) {
        this.data.streak = 0;
      }
    }

    // Load today's entry if exists
    const todayEntry = this.data.entries.find(e => e.date === today);
    if (todayEntry) {
      this.todayEntries = todayEntry.items;
      this.entryInputs.forEach((input, index) => {
        input.value = this.todayEntries[index] || '';
      });
      this.saveBtn.textContent = '更新今日感恩';
    }

    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ gratitudeData: this.data });
  }

  updateSaveButton() {
    const hasContent = this.todayEntries.some(e => e.trim());
    this.saveBtn.disabled = !hasContent;
  }

  async saveEntry() {
    const today = new Date().toDateString();
    const filledEntries = this.todayEntries.filter(e => e.trim());

    if (filledEntries.length === 0) return;

    // Find or create today's entry
    const existingIndex = this.data.entries.findIndex(e => e.date === today);
    const entry = {
      date: today,
      items: this.todayEntries.filter(e => e.trim()),
      timestamp: Date.now()
    };

    if (existingIndex !== -1) {
      this.data.entries[existingIndex] = entry;
    } else {
      this.data.entries.push(entry);
      // Update streak
      if (this.data.lastDate !== today) {
        const lastDate = this.data.lastDate ? new Date(this.data.lastDate) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (!lastDate || lastDate.toDateString() === yesterday.toDateString()) {
          this.data.streak++;
        } else {
          this.data.streak = 1;
        }
      }
    }

    this.data.lastDate = today;

    // Keep only last 30 entries
    if (this.data.entries.length > 30) {
      this.data.entries = this.data.entries.slice(-30);
    }

    await this.saveData();
    this.updateUI();

    this.saveBtn.textContent = '已儲存 ✓';
    setTimeout(() => {
      this.saveBtn.textContent = '更新今日感恩';
    }, 2000);
  }

  updateUI() {
    // Stats
    this.streakEl.textContent = this.data.streak;
    this.totalEntriesEl.textContent = this.data.entries.reduce((sum, e) => sum + e.items.length, 0);

    // History
    this.historyList.innerHTML = '';
    const pastEntries = this.data.entries
      .filter(e => e.date !== new Date().toDateString())
      .slice(-5)
      .reverse();

    pastEntries.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });

      item.innerHTML = `
        <div class="history-date">${formattedDate}</div>
        <div class="history-entries">${entry.items.map(i => `• ${i}`).join('<br>')}</div>
      `;

      this.historyList.appendChild(item);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new GratitudeJournal();
});
