// Mood Tracker - Popup Script

const moodValues = {
  great: 5,
  good: 4,
  okay: 3,
  bad: 2,
  terrible: 1
};

const moodEmojis = {
  great: '😄',
  good: '😊',
  okay: '😐',
  bad: '😔',
  terrible: '😢'
};

class MoodTracker {
  constructor() {
    this.data = {
      entries: [],
      streak: 0,
      lastDate: null
    };
    this.selectedMood = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.currentDateEl = document.getElementById('currentDate');
    this.moodBtns = document.querySelectorAll('.mood-btn');
    this.noteInput = document.getElementById('noteInput');
    this.weekView = document.getElementById('weekView');
    this.avgMoodEl = document.getElementById('avgMood');
    this.streakEl = document.getElementById('streak');
    this.totalDaysEl = document.getElementById('totalDays');
    this.historyList = document.getElementById('historyList');
  }

  bindEvents() {
    this.moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMood = btn.dataset.mood;
        this.saveMood();
      });
    });

    this.noteInput.addEventListener('blur', () => {
      if (this.selectedMood) {
        this.saveMood();
      }
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('moodTrackerData');
    if (result.moodTrackerData) {
      this.data = { ...this.data, ...result.moodTrackerData };
    }

    // Update date display
    const now = new Date();
    this.currentDateEl.textContent = now.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
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

    // Load today's entry
    const todayEntry = this.data.entries.find(e => e.date === today);
    if (todayEntry) {
      this.selectedMood = todayEntry.mood;
      this.noteInput.value = todayEntry.note || '';
      this.moodBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mood === this.selectedMood);
      });
    }

    this.updateUI();
    await this.saveData();
  }

  async saveData() {
    await chrome.storage.local.set({ moodTrackerData: this.data });
  }

  async saveMood() {
    if (!this.selectedMood) return;

    const today = new Date().toDateString();
    const existingIndex = this.data.entries.findIndex(e => e.date === today);

    const entry = {
      date: today,
      mood: this.selectedMood,
      note: this.noteInput.value.trim(),
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

    // Keep last 60 days
    if (this.data.entries.length > 60) {
      this.data.entries = this.data.entries.slice(-60);
    }

    await this.saveData();
    this.updateUI();
  }

  updateUI() {
    this.updateWeekView();
    this.updateStats();
    this.updateHistory();
  }

  updateWeekView() {
    const now = new Date();
    const today = now.getDay();

    // Get start of week (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - today);

    const dayItems = this.weekView.querySelectorAll('.day-item');
    dayItems.forEach((item, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toDateString();

      const entry = this.data.entries.find(e => e.date === dateStr);
      const moodSpan = item.querySelector('.day-mood');

      if (entry) {
        moodSpan.textContent = moodEmojis[entry.mood];
      } else {
        moodSpan.textContent = '-';
      }

      item.classList.toggle('today', index === today);
    });
  }

  updateStats() {
    // Average mood
    if (this.data.entries.length > 0) {
      const last7 = this.data.entries.slice(-7);
      const avg = last7.reduce((sum, e) => sum + moodValues[e.mood], 0) / last7.length;

      if (avg >= 4.5) this.avgMoodEl.textContent = '😄';
      else if (avg >= 3.5) this.avgMoodEl.textContent = '😊';
      else if (avg >= 2.5) this.avgMoodEl.textContent = '😐';
      else if (avg >= 1.5) this.avgMoodEl.textContent = '😔';
      else this.avgMoodEl.textContent = '😢';
    }

    this.streakEl.textContent = this.data.streak;
    this.totalDaysEl.textContent = this.data.entries.length;
  }

  updateHistory() {
    this.historyList.innerHTML = '';

    const recent = this.data.entries
      .filter(e => e.date !== new Date().toDateString())
      .slice(-5)
      .reverse();

    recent.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric'
      });

      item.innerHTML = `
        <span class="history-emoji">${moodEmojis[entry.mood]}</span>
        <div class="history-info">
          <div class="history-date">${formattedDate}</div>
          ${entry.note ? `<div class="history-note">${entry.note.substring(0, 30)}${entry.note.length > 30 ? '...' : ''}</div>` : ''}
        </div>
      `;

      this.historyList.appendChild(item);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new MoodTracker();
});
