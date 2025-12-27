// Daily Journal - Popup Script

const moodEmojis = {
  happy: '😊',
  excited: '🤩',
  calm: '😌',
  tired: '😴',
  sad: '😢',
  angry: '😠'
};

class DailyJournal {
  constructor() {
    this.data = {
      entries: {}
    };
    this.currentDate = new Date();
    this.selectedMood = null;
    this.currentTags = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.toggleBtns = document.querySelectorAll('.toggle-btn');
    this.writeView = document.getElementById('writeView');
    this.entriesView = document.getElementById('entriesView');
    this.prevDayBtn = document.getElementById('prevDay');
    this.nextDayBtn = document.getElementById('nextDay');
    this.currentDateEl = document.getElementById('currentDate');
    this.journalContent = document.getElementById('journalContent');
    this.moodBtns = document.querySelectorAll('.mood-btn');
    this.tagInput = document.getElementById('tagInput');
    this.tagsList = document.getElementById('tagsList');
    this.saveBtn = document.getElementById('saveBtn');
    this.searchInput = document.getElementById('searchInput');
    this.entriesList = document.getElementById('entriesList');
    this.totalEntriesEl = document.getElementById('totalEntries');
    this.streakDaysEl = document.getElementById('streakDays');
    this.totalWordsEl = document.getElementById('totalWords');
  }

  bindEvents() {
    // View toggle
    this.toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        this.writeView.classList.toggle('active', view === 'write');
        this.entriesView.classList.toggle('active', view === 'entries');
        if (view === 'entries') {
          this.renderEntries();
        }
      });
    });

    // Date navigation
    this.prevDayBtn.addEventListener('click', () => this.changeDate(-1));
    this.nextDayBtn.addEventListener('click', () => this.changeDate(1));

    // Mood selection
    this.moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMood = btn.dataset.mood;
      });
    });

    // Tags
    this.tagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.tagInput.value.trim()) {
        e.preventDefault();
        this.addTag(this.tagInput.value.trim());
        this.tagInput.value = '';
      }
    });

    // Save
    this.saveBtn.addEventListener('click', () => this.saveEntry());

    // Search
    this.searchInput.addEventListener('input', () => this.renderEntries());
  }

  async loadData() {
    const result = await chrome.storage.local.get('dailyJournalData');
    if (result.dailyJournalData) {
      this.data = result.dailyJournalData;
    }
    this.updateDateDisplay();
    this.loadEntryForDate();
    this.updateStats();
  }

  async saveData() {
    await chrome.storage.local.set({ dailyJournalData: this.data });
  }

  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  formatDate(date) {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }

  changeDate(delta) {
    this.currentDate.setDate(this.currentDate.getDate() + delta);
    this.updateDateDisplay();
    this.loadEntryForDate();
  }

  updateDateDisplay() {
    this.currentDateEl.textContent = this.formatDate(this.currentDate);

    // Disable next if future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    this.nextDayBtn.disabled = this.currentDate >= today;
    this.nextDayBtn.style.opacity = this.nextDayBtn.disabled ? '0.3' : '1';
  }

  loadEntryForDate() {
    const key = this.getDateKey(this.currentDate);
    const entry = this.data.entries[key];

    if (entry) {
      this.journalContent.value = entry.content;
      this.selectedMood = entry.mood;
      this.currentTags = [...(entry.tags || [])];

      this.moodBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mood === entry.mood);
      });
    } else {
      this.journalContent.value = '';
      this.selectedMood = null;
      this.currentTags = [];
      this.moodBtns.forEach(btn => btn.classList.remove('selected'));
    }

    this.renderTags();
  }

  addTag(tag) {
    if (!this.currentTags.includes(tag) && this.currentTags.length < 5) {
      this.currentTags.push(tag);
      this.renderTags();
    }
  }

  removeTag(tag) {
    this.currentTags = this.currentTags.filter(t => t !== tag);
    this.renderTags();
  }

  renderTags() {
    this.tagsList.innerHTML = this.currentTags.map(tag => `
      <span class="tag">
        ${tag}
        <span class="tag-remove" data-tag="${tag}">×</span>
      </span>
    `).join('');

    this.tagsList.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => this.removeTag(btn.dataset.tag));
    });
  }

  async saveEntry() {
    const content = this.journalContent.value.trim();
    if (!content) {
      this.saveBtn.textContent = '請輸入內容';
      setTimeout(() => {
        this.saveBtn.textContent = '儲存日記';
      }, 1500);
      return;
    }

    const key = this.getDateKey(this.currentDate);
    this.data.entries[key] = {
      content,
      mood: this.selectedMood,
      tags: [...this.currentTags],
      wordCount: content.length,
      updatedAt: Date.now()
    };

    await this.saveData();
    this.updateStats();

    this.saveBtn.textContent = '已儲存 ✓';
    setTimeout(() => {
      this.saveBtn.textContent = '儲存日記';
    }, 1500);
  }

  renderEntries() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const entries = Object.entries(this.data.entries)
      .filter(([key, entry]) => {
        if (!searchTerm) return true;
        return entry.content.toLowerCase().includes(searchTerm) ||
               (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchTerm)));
      })
      .sort(([a], [b]) => b.localeCompare(a));

    this.entriesList.innerHTML = entries.map(([key, entry]) => {
      const date = new Date(key);
      const formattedDate = date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });

      return `
        <div class="entry-card" data-date="${key}">
          <div class="entry-header">
            <span class="entry-date">${formattedDate}</span>
            ${entry.mood ? `<span class="entry-mood">${moodEmojis[entry.mood]}</span>` : ''}
          </div>
          <div class="entry-preview">${entry.content}</div>
          ${entry.tags && entry.tags.length > 0 ? `
            <div class="entry-tags">
              ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Click to view entry
    this.entriesList.querySelectorAll('.entry-card').forEach(card => {
      card.addEventListener('click', () => {
        const dateKey = card.dataset.date;
        this.currentDate = new Date(dateKey);
        this.updateDateDisplay();
        this.loadEntryForDate();

        // Switch to write view
        this.toggleBtns.forEach(b => b.classList.remove('active'));
        this.toggleBtns[0].classList.add('active');
        this.writeView.classList.add('active');
        this.entriesView.classList.remove('active');
      });
    });
  }

  updateStats() {
    const entries = Object.entries(this.data.entries);

    // Total entries
    this.totalEntriesEl.textContent = entries.length;

    // Total words
    const totalWords = entries.reduce((sum, [, entry]) => sum + (entry.wordCount || 0), 0);
    this.totalWordsEl.textContent = totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords;

    // Streak calculation
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);

    while (true) {
      const key = this.getDateKey(checkDate);
      if (this.data.entries[key]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (checkDate.toDateString() === today.toDateString()) {
        // Today might not have entry yet
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    this.streakDaysEl.textContent = streak;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new DailyJournal();
});
