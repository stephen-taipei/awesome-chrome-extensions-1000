// Daily Journal - Popup Script

class DailyJournal {
  constructor() {
    this.currentDate = new Date();
    this.currentMonth = new Date();
    this.entries = {};
    this.allTags = [];
    this.saveTimeout = null;

    this.initElements();
    this.loadData();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Navigation
    this.prevDayBtn = document.getElementById('prevDay');
    this.nextDayBtn = document.getElementById('nextDay');
    this.currentDateEl = document.getElementById('currentDate');

    // Journal
    this.moodPicker = document.getElementById('moodPicker');
    this.journalContent = document.getElementById('journalContent');
    this.selectedTagsEl = document.getElementById('selectedTags');
    this.tagInput = document.getElementById('tagInput');
    this.suggestedTagsEl = document.getElementById('suggestedTags');
    this.saveStatus = document.getElementById('saveStatus');
    this.exportBtn = document.getElementById('exportBtn');

    // Views
    this.journalView = document.getElementById('journalView');
    this.calendarView = document.getElementById('calendarView');
    this.statsView = document.getElementById('statsView');
    this.calendarBtn = document.getElementById('calendarBtn');
    this.statsBtn = document.getElementById('statsBtn');

    // Calendar
    this.prevMonthBtn = document.getElementById('prevMonth');
    this.nextMonthBtn = document.getElementById('nextMonth');
    this.calendarMonthEl = document.getElementById('calendarMonth');
    this.calendarDaysEl = document.getElementById('calendarDays');
    this.backToJournalBtn = document.getElementById('backToJournal');

    // Stats
    this.moodChartEl = document.getElementById('moodChart');
    this.statsDetailsEl = document.getElementById('statsDetails');
    this.topTagsEl = document.getElementById('topTags');
    this.backFromStatsBtn = document.getElementById('backFromStats');
    this.periodBtns = document.querySelectorAll('.period-btn');

    this.toast = document.getElementById('toast');
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['journalEntries', 'journalTags']);
      this.entries = result.journalEntries || {};
      this.allTags = result.journalTags || ['工作', '家庭', '健康', '學習', '運動', '社交', '休閒', '感恩'];
      this.renderSuggestedTags();
      this.loadCurrentEntry();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  loadCurrentEntry() {
    const key = this.getDateKey(this.currentDate);
    const entry = this.entries[key] || { mood: null, content: '', tags: [] };

    // Clear mood selection
    this.moodPicker.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.mood === entry.mood) {
        btn.classList.add('selected');
      }
    });

    this.journalContent.value = entry.content;
    this.renderSelectedTags(entry.tags);
    this.updateSaveStatus();
  }

  renderSelectedTags(tags) {
    this.selectedTagsEl.innerHTML = tags.map(tag => `
      <span class="tag">
        ${this.escapeHtml(tag)}
        <span class="remove-tag" data-tag="${this.escapeHtml(tag)}">×</span>
      </span>
    `).join('');
  }

  renderSuggestedTags() {
    const currentTags = this.getCurrentTags();
    const available = this.allTags.filter(tag => !currentTags.includes(tag)).slice(0, 8);

    this.suggestedTagsEl.innerHTML = available.map(tag => `
      <button class="suggested-tag" data-tag="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}</button>
    `).join('');
  }

  getCurrentTags() {
    const key = this.getDateKey(this.currentDate);
    return this.entries[key]?.tags || [];
  }

  addTag(tag) {
    const key = this.getDateKey(this.currentDate);
    if (!this.entries[key]) {
      this.entries[key] = { mood: null, content: '', tags: [] };
    }

    tag = tag.trim();
    if (tag && !this.entries[key].tags.includes(tag)) {
      this.entries[key].tags.push(tag);

      // Add to all tags if new
      if (!this.allTags.includes(tag)) {
        this.allTags.push(tag);
      }

      this.renderSelectedTags(this.entries[key].tags);
      this.renderSuggestedTags();
      this.scheduleAutoSave();
    }
  }

  removeTag(tag) {
    const key = this.getDateKey(this.currentDate);
    if (this.entries[key]) {
      this.entries[key].tags = this.entries[key].tags.filter(t => t !== tag);
      this.renderSelectedTags(this.entries[key].tags);
      this.renderSuggestedTags();
      this.scheduleAutoSave();
    }
  }

  setMood(mood) {
    const key = this.getDateKey(this.currentDate);
    if (!this.entries[key]) {
      this.entries[key] = { mood: null, content: '', tags: [] };
    }
    this.entries[key].mood = mood;

    this.moodPicker.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.mood === mood);
    });

    this.scheduleAutoSave();
  }

  scheduleAutoSave() {
    clearTimeout(this.saveTimeout);
    this.saveStatus.textContent = '儲存中...';
    this.saveStatus.classList.remove('saved');

    this.saveTimeout = setTimeout(() => this.saveData(), 1000);
  }

  async saveData() {
    const key = this.getDateKey(this.currentDate);
    if (!this.entries[key]) {
      this.entries[key] = { mood: null, content: '', tags: [] };
    }
    this.entries[key].content = this.journalContent.value;

    try {
      await chrome.storage.local.set({
        journalEntries: this.entries,
        journalTags: this.allTags
      });
      this.updateSaveStatus(true);
    } catch (error) {
      console.error('Failed to save:', error);
      this.saveStatus.textContent = '儲存失敗';
    }
  }

  updateSaveStatus(justSaved = false) {
    const key = this.getDateKey(this.currentDate);
    const entry = this.entries[key];

    if (justSaved) {
      this.saveStatus.textContent = '✓ 已儲存';
      this.saveStatus.classList.add('saved');
    } else if (entry && (entry.content || entry.mood || entry.tags.length)) {
      this.saveStatus.textContent = '✓ 已儲存';
      this.saveStatus.classList.add('saved');
    } else {
      this.saveStatus.textContent = '';
      this.saveStatus.classList.remove('saved');
    }
  }

  render() {
    this.renderDate();
    this.updateNavButtons();
  }

  renderDate() {
    const today = new Date();
    const isToday = this.getDateKey(this.currentDate) === this.getDateKey(today);

    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    let dateStr = this.currentDate.toLocaleDateString('zh-TW', options);

    if (isToday) {
      dateStr = '今天 - ' + dateStr;
    }

    this.currentDateEl.textContent = dateStr;
  }

  updateNavButtons() {
    const today = new Date();
    this.nextDayBtn.disabled = this.getDateKey(this.currentDate) >= this.getDateKey(today);
  }

  changeDate(days) {
    this.saveData();
    this.currentDate.setDate(this.currentDate.getDate() + days);
    this.loadCurrentEntry();
    this.render();
  }

  showView(viewName) {
    this.journalView.classList.remove('active');
    this.calendarView.classList.remove('active');
    this.statsView.classList.remove('active');

    if (viewName === 'journal') {
      this.journalView.classList.add('active');
    } else if (viewName === 'calendar') {
      this.calendarView.classList.add('active');
      this.renderCalendar();
    } else if (viewName === 'stats') {
      this.statsView.classList.add('active');
      this.renderStats('week');
    }
  }

  renderCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    this.calendarMonthEl.textContent = `${year} 年 ${month + 1} 月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    const todayKey = this.getDateKey(today);

    let html = '';

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      html += `<div class="calendar-day other-month">${day}</div>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = this.getDateKey(date);
      const entry = this.entries[dateKey];
      const isToday = dateKey === todayKey;
      const hasEntry = entry && (entry.content || entry.mood);

      const moodEmoji = entry?.mood ? this.getMoodEmoji(entry.mood) : '';

      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : ''}"
             data-date="${dateKey}">
          ${day}
          <span class="mood-indicator">${moodEmoji}</span>
        </div>
      `;
    }

    // Next month days
    const remainingDays = 42 - (startDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      html += `<div class="calendar-day other-month">${day}</div>`;
    }

    this.calendarDaysEl.innerHTML = html;
  }

  getMoodEmoji(mood) {
    const moods = {
      'great': '😄',
      'good': '🙂',
      'neutral': '😐',
      'bad': '😔',
      'terrible': '😢'
    };
    return moods[mood] || '';
  }

  renderStats(period) {
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const moodCounts = { great: 0, good: 0, neutral: 0, bad: 0, terrible: 0 };
    const tagCounts = {};
    let totalEntries = 0;

    Object.entries(this.entries).forEach(([dateKey, entry]) => {
      const date = new Date(dateKey);
      if (date >= startDate && date <= now) {
        if (entry.mood) {
          moodCounts[entry.mood]++;
          totalEntries++;
        }
        entry.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Render mood chart
    const maxCount = Math.max(...Object.values(moodCounts), 1);
    const moods = ['great', 'good', 'neutral', 'bad', 'terrible'];
    const emojis = ['😄', '🙂', '😐', '😔', '😢'];

    this.moodChartEl.innerHTML = moods.map((mood, i) => {
      const count = moodCounts[mood];
      const height = (count / maxCount) * 60;
      return `
        <div class="mood-bar">
          <div class="bar" style="height: ${height}px"></div>
          <span class="label">${emojis[i]}</span>
          <span class="count">${count}</span>
        </div>
      `;
    }).join('');

    // Stats details
    const periodNames = { week: '本週', month: '本月', year: '今年' };
    this.statsDetailsEl.innerHTML = `${periodNames[period]}共記錄 <strong>${totalEntries}</strong> 天心情`;

    // Top tags
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    this.topTagsEl.innerHTML = sortedTags.map(([tag, count]) =>
      `<span class="tag-stat">${this.escapeHtml(tag)} (${count})</span>`
    ).join('');

    // Update period buttons
    this.periodBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.period === period);
    });
  }

  async exportData() {
    const entries = Object.entries(this.entries)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, entry]) => {
        const mood = entry.mood ? this.getMoodEmoji(entry.mood) : '無記錄';
        const tags = entry.tags?.join(', ') || '';
        return `## ${date}\n\n心情：${mood}\n\n${entry.content || '無內容'}\n\n標籤：${tags || '無'}\n\n---\n`;
      })
      .join('\n');

    const content = `# Daily Journal 匯出\n\n匯出時間：${new Date().toLocaleString('zh-TW')}\n\n---\n\n${entries}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-export-${this.getDateKey(new Date())}.md`;
    a.click();

    URL.revokeObjectURL(url);
    this.showToast('已匯出日記', 'success');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    // Date navigation
    this.prevDayBtn.addEventListener('click', () => this.changeDate(-1));
    this.nextDayBtn.addEventListener('click', () => this.changeDate(1));

    // Mood selection
    this.moodPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.mood-btn');
      if (btn) this.setMood(btn.dataset.mood);
    });

    // Journal content auto-save
    this.journalContent.addEventListener('input', () => this.scheduleAutoSave());

    // Tags
    this.tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTag(this.tagInput.value);
        this.tagInput.value = '';
      }
    });

    this.suggestedTagsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggested-tag')) {
        this.addTag(e.target.dataset.tag);
      }
    });

    this.selectedTagsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-tag')) {
        this.removeTag(e.target.dataset.tag);
      }
    });

    // Export
    this.exportBtn.addEventListener('click', () => this.exportData());

    // View switching
    this.calendarBtn.addEventListener('click', () => this.showView('calendar'));
    this.statsBtn.addEventListener('click', () => this.showView('stats'));
    this.backToJournalBtn.addEventListener('click', () => this.showView('journal'));
    this.backFromStatsBtn.addEventListener('click', () => this.showView('journal'));

    // Calendar navigation
    this.prevMonthBtn.addEventListener('click', () => {
      this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
      this.renderCalendar();
    });

    this.nextMonthBtn.addEventListener('click', () => {
      this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
      this.renderCalendar();
    });

    this.calendarDaysEl.addEventListener('click', (e) => {
      const dayEl = e.target.closest('.calendar-day');
      if (dayEl && dayEl.dataset.date) {
        this.currentDate = new Date(dayEl.dataset.date);
        this.showView('journal');
        this.loadCurrentEntry();
        this.render();
      }
    });

    // Stats period
    this.periodBtns.forEach(btn => {
      btn.addEventListener('click', () => this.renderStats(btn.dataset.period));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DailyJournal();
});
