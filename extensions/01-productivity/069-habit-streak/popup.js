// Habit Streak - Popup Script

class HabitStreak {
  constructor() {
    this.data = {
      habits: []
    };
    this.today = this.getDateKey(new Date());
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.updateDateDisplay();
  }

  initElements() {
    this.todayDateEl = document.getElementById('todayDate');
    this.habitInput = document.getElementById('habitInput');
    this.addBtn = document.getElementById('addBtn');
    this.habitsList = document.getElementById('habitsList');
    this.longestStreakEl = document.getElementById('longestStreak');
    this.todayCompletedEl = document.getElementById('todayCompleted');
    this.weeklyRateEl = document.getElementById('weeklyRate');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addHabit());
    this.habitInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addHabit();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('habitStreakData');
    if (result.habitStreakData) {
      this.data = result.habitStreakData;
    }
    this.renderHabits();
    this.updateStats();
  }

  async saveData() {
    await chrome.storage.local.set({ habitStreakData: this.data });
  }

  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  updateDateDisplay() {
    const today = new Date();
    this.todayDateEl.textContent = today.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addHabit() {
    const name = this.habitInput.value.trim();
    if (!name) return;

    const habit = {
      id: this.generateId(),
      name,
      completedDates: [],
      createdAt: Date.now()
    };

    this.data.habits.push(habit);
    await this.saveData();

    this.habitInput.value = '';
    this.renderHabits();
    this.updateStats();
  }

  async toggleHabit(id) {
    const habit = this.data.habits.find(h => h.id === id);
    if (habit) {
      const index = habit.completedDates.indexOf(this.today);
      if (index === -1) {
        habit.completedDates.push(this.today);
      } else {
        habit.completedDates.splice(index, 1);
      }
      await this.saveData();
      this.renderHabits();
      this.updateStats();
    }
  }

  async deleteHabit(id) {
    this.data.habits = this.data.habits.filter(h => h.id !== id);
    await this.saveData();
    this.renderHabits();
    this.updateStats();
  }

  calculateStreak(habit) {
    const dates = [...habit.completedDates].sort().reverse();
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);

    while (true) {
      const key = this.getDateKey(checkDate);
      if (dates.includes(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (this.getDateKey(checkDate) === this.today) {
        // Today might not be completed yet
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  getRecentDays(habit, days = 7) {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = this.getDateKey(date);
      result.push(habit.completedDates.includes(key));
    }

    return result;
  }

  renderHabits() {
    this.habitsList.innerHTML = this.data.habits.map(habit => {
      const isChecked = habit.completedDates.includes(this.today);
      const streak = this.calculateStreak(habit);
      const recentDays = this.getRecentDays(habit);

      return `
        <div class="habit-card" data-id="${habit.id}">
          <div class="habit-check ${isChecked ? 'checked' : ''}">${isChecked ? '✓' : ''}</div>
          <div class="habit-content">
            <div class="habit-name">${habit.name}</div>
            <div class="habit-streak">
              ${streak > 0 ? `<span class="streak-fire">🔥</span><span>${streak} 天連續</span>` : '<span>開始你的連續紀錄！</span>'}
            </div>
          </div>
          <div class="streak-days">
            ${recentDays.map(active => `<div class="streak-dot ${active ? 'active' : ''}"></div>`).join('')}
          </div>
          <div class="habit-actions">
            <button class="action-btn delete delete-btn" title="刪除">×</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind events
    this.habitsList.querySelectorAll('.habit-card').forEach(card => {
      const id = card.dataset.id;

      card.querySelector('.habit-check').addEventListener('click', () => this.toggleHabit(id));
      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteHabit(id);
      });
    });
  }

  updateStats() {
    // Longest streak across all habits
    let longestStreak = 0;
    this.data.habits.forEach(habit => {
      const streak = this.calculateStreak(habit);
      if (streak > longestStreak) longestStreak = streak;
    });
    this.longestStreakEl.textContent = longestStreak;

    // Today completed
    const total = this.data.habits.length;
    const completed = this.data.habits.filter(h => h.completedDates.includes(this.today)).length;
    this.todayCompletedEl.textContent = `${completed}/${total}`;

    // Weekly rate
    if (total > 0) {
      let weeklyCompleted = 0;
      let weeklyTotal = 0;

      this.data.habits.forEach(habit => {
        const recentDays = this.getRecentDays(habit);
        weeklyCompleted += recentDays.filter(Boolean).length;
        weeklyTotal += 7;
      });

      const rate = Math.round((weeklyCompleted / weeklyTotal) * 100);
      this.weeklyRateEl.textContent = rate + '%';
    } else {
      this.weeklyRateEl.textContent = '0%';
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new HabitStreak();
});
