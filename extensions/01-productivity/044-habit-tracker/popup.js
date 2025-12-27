// Habit Tracker - Popup Script

class HabitTracker {
  constructor() {
    this.habits = [];
    this.editingId = null;
    this.selectedEmoji = '💪';
    this.initElements();
    this.bindEvents();
    this.loadHabits();
    this.updateDateDisplay();
  }

  initElements() {
    this.habitList = document.getElementById('habitList');
    this.emptyState = document.getElementById('emptyState');
    this.dateDisplay = document.getElementById('dateDisplay');
    this.todayCount = document.getElementById('todayCount');
    this.totalHabits = document.getElementById('totalHabits');
    this.bestStreak = document.getElementById('bestStreak');

    // Modal
    this.addBtn = document.getElementById('addBtn');
    this.modal = document.getElementById('habitModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.habitName = document.getElementById('habitName');
    this.emojiPicker = document.getElementById('emojiPicker');
    this.saveHabitBtn = document.getElementById('saveHabitBtn');
    this.deleteHabitBtn = document.getElementById('deleteHabitBtn');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.openAddModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.saveHabitBtn.addEventListener('click', () => this.saveHabit());
    this.deleteHabitBtn.addEventListener('click', () => this.deleteHabit());
    this.habitName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveHabit();
    });

    // Emoji picker
    this.emojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.emojiPicker.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedEmoji = btn.dataset.emoji;
      });
    });
  }

  updateDateDisplay() {
    const today = new Date();
    this.dateDisplay.textContent = today.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  async loadHabits() {
    const result = await chrome.storage.local.get(['habits']);
    this.habits = result.habits || [];
    this.renderHabits();
    this.updateStats();
  }

  async saveHabits() {
    await chrome.storage.local.set({ habits: this.habits });
    this.updateStats();
  }

  openAddModal() {
    this.editingId = null;
    this.modalTitle.textContent = '新增習慣';
    this.deleteHabitBtn.classList.add('hidden');
    this.habitName.value = '';
    this.selectedEmoji = '💪';
    this.emojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.emoji === '💪');
    });
    this.modal.classList.remove('hidden');
    this.habitName.focus();
  }

  openEditModal(habit) {
    this.editingId = habit.id;
    this.modalTitle.textContent = '編輯習慣';
    this.deleteHabitBtn.classList.remove('hidden');
    this.habitName.value = habit.name;
    this.selectedEmoji = habit.emoji;
    this.emojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.emoji === habit.emoji);
    });
    this.modal.classList.remove('hidden');
    this.habitName.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.editingId = null;
  }

  async saveHabit() {
    const name = this.habitName.value.trim();
    if (!name) return;

    if (this.editingId) {
      const habit = this.habits.find(h => h.id === this.editingId);
      if (habit) {
        habit.name = name;
        habit.emoji = this.selectedEmoji;
      }
    } else {
      const habit = {
        id: Date.now().toString(),
        name,
        emoji: this.selectedEmoji,
        completedDates: [],
        createdAt: new Date().toISOString()
      };
      this.habits.push(habit);
    }

    await this.saveHabits();
    this.renderHabits();
    this.closeModal();
  }

  async deleteHabit() {
    if (!this.editingId) return;

    this.habits = this.habits.filter(h => h.id !== this.editingId);
    await this.saveHabits();
    this.renderHabits();
    this.closeModal();
  }

  async toggleHabit(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = this.getTodayKey();
    const index = habit.completedDates.indexOf(today);

    if (index === -1) {
      habit.completedDates.push(today);
    } else {
      habit.completedDates.splice(index, 1);
    }

    await this.saveHabits();
    this.renderHabits();
  }

  getStreak(habit) {
    const dates = [...habit.completedDates].sort().reverse();
    if (dates.length === 0) return 0;

    const today = this.getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    // Must have completed today or yesterday to have active streak
    if (dates[0] !== today && dates[0] !== yesterdayKey) {
      return 0;
    }

    let streak = 1;
    let checkDate = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkKey = checkDate.toISOString().split('T')[0];

      if (dates[i] === checkKey) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  getBestStreak(habit) {
    const dates = [...habit.completedDates].sort();
    if (dates.length === 0) return 0;

    let bestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return bestStreak;
  }

  getWeekDots(habit) {
    const dots = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      dots.push({
        completed: habit.completedDates.includes(dateKey),
        isToday: i === 0
      });
    }

    return dots;
  }

  updateStats() {
    const today = this.getTodayKey();
    let completedToday = 0;
    let overallBestStreak = 0;

    this.habits.forEach(habit => {
      if (habit.completedDates.includes(today)) {
        completedToday++;
      }
      overallBestStreak = Math.max(overallBestStreak, this.getBestStreak(habit));
    });

    this.todayCount.textContent = completedToday;
    this.totalHabits.textContent = this.habits.length;
    this.bestStreak.textContent = overallBestStreak;
  }

  renderHabits() {
    this.habitList.innerHTML = '';
    const today = this.getTodayKey();

    if (this.habits.length === 0) {
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    this.habits.forEach(habit => {
      const isCompletedToday = habit.completedDates.includes(today);
      const streak = this.getStreak(habit);
      const weekDots = this.getWeekDots(habit);

      const item = document.createElement('div');
      item.className = `habit-item ${isCompletedToday ? 'completed-today' : ''}`;

      item.innerHTML = `
        <button class="habit-check" data-id="${habit.id}">
          ${isCompletedToday ? '✓' : habit.emoji}
        </button>
        <div class="habit-info">
          <div class="habit-name">${this.escapeHtml(habit.name)}</div>
          <div class="habit-streak">
            ${streak > 0 ? `<span class="streak-fire">🔥</span> ${streak} 天連續` : '開始你的連續記錄'}
          </div>
          <div class="week-dots">
            ${weekDots.map(dot => `
              <div class="week-dot ${dot.completed ? 'completed' : ''} ${dot.isToday ? 'today' : ''}"></div>
            `).join('')}
          </div>
        </div>
      `;

      // Check button click
      const checkBtn = item.querySelector('.habit-check');
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleHabit(habit.id);
      });

      // Item click to edit
      item.addEventListener('click', () => {
        this.openEditModal(habit);
      });

      this.habitList.appendChild(item);
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new HabitTracker();
});
