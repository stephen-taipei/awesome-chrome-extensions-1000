// Daily Goals - Popup Script

const MAX_GOALS = 5;
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

class DailyGoals {
  constructor() {
    this.goals = [];
    this.stats = {
      currentStreak: 0,
      bestStreak: 0,
      weeklyData: {}
    };

    this.initElements();
    this.loadData();
    this.bindEvents();
  }

  initElements() {
    this.dateDisplay = document.getElementById('dateDisplay');
    this.streakBadge = document.getElementById('streakBadge');
    this.progressCircle = document.getElementById('progressCircle');
    this.progressPercent = document.getElementById('progressPercent');
    this.goalsList = document.getElementById('goalsList');
    this.goalInput = document.getElementById('goalInput');
    this.addGoalBtn = document.getElementById('addGoalBtn');
    this.addGoalSection = document.getElementById('addGoalSection');
    this.goalLimit = document.getElementById('goalLimit');
    this.weekComplete = document.getElementById('weekComplete');
    this.currentStreak = document.getElementById('currentStreak');
    this.bestStreak = document.getElementById('bestStreak');
    this.weekChart = document.getElementById('weekChart');
  }

  getDateKey(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['dailyGoals', 'dailyGoalsStats']);
      const today = this.getDateKey();

      // Load today's goals
      const allGoals = result.dailyGoals || {};
      this.goals = allGoals[today] || [];

      // Load stats
      this.stats = result.dailyGoalsStats || {
        currentStreak: 0,
        bestStreak: 0,
        weeklyData: {}
      };

      this.render();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      const today = this.getDateKey();
      const result = await chrome.storage.local.get(['dailyGoals']);
      const allGoals = result.dailyGoals || {};

      allGoals[today] = this.goals;

      // Update weekly data
      const completed = this.goals.filter(g => g.completed).length;
      const total = this.goals.length;
      this.stats.weeklyData[today] = { completed, total };

      // Calculate streak
      this.calculateStreak();

      await chrome.storage.local.set({
        dailyGoals: allGoals,
        dailyGoalsStats: this.stats
      });

      this.updateBadge();
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  calculateStreak() {
    const today = new Date();
    let streak = 0;
    let date = new Date(today);

    // Check if today is complete
    const todayCompleted = this.goals.length > 0 &&
      this.goals.every(g => g.completed);

    if (todayCompleted) {
      streak = 1;
      date.setDate(date.getDate() - 1);
    }

    // Check previous days
    while (true) {
      const dateKey = this.getDateKey(date);
      const dayData = this.stats.weeklyData[dateKey];

      if (!dayData || dayData.total === 0 || dayData.completed < dayData.total) {
        break;
      }

      streak++;
      date.setDate(date.getDate() - 1);
    }

    this.stats.currentStreak = streak;
    if (streak > this.stats.bestStreak) {
      this.stats.bestStreak = streak;
    }
  }

  updateBadge() {
    const completed = this.goals.filter(g => g.completed).length;
    const total = this.goals.length;

    if (total === 0) {
      chrome.runtime.sendMessage({ type: 'updateBadge', text: '' });
    } else if (completed === total) {
      chrome.runtime.sendMessage({ type: 'updateBadge', text: '✓', color: '#22c55e' });
    } else {
      chrome.runtime.sendMessage({ type: 'updateBadge', text: `${completed}/${total}`, color: '#f59e0b' });
    }
  }

  render() {
    // Update date display
    const now = new Date();
    this.dateDisplay.textContent = now.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    // Update streak badge
    this.streakBadge.textContent = `🔥 ${this.stats.currentStreak}`;

    // Update progress ring
    const completed = this.goals.filter(g => g.completed).length;
    const total = this.goals.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.progressPercent.textContent = `${percent}%`;
    const offset = 264 - (264 * percent / 100);
    this.progressCircle.style.strokeDashoffset = offset;

    // Render goals list
    this.renderGoals();

    // Update add button state
    this.addGoalBtn.disabled = this.goals.length >= MAX_GOALS;
    this.goalLimit.textContent = `${this.goals.length}/${MAX_GOALS} 個目標`;
    this.addGoalSection.style.display = this.goals.length >= MAX_GOALS ? 'none' : 'flex';

    // Update stats
    this.currentStreak.textContent = this.stats.currentStreak;
    this.bestStreak.textContent = this.stats.bestStreak;

    // Calculate week complete
    const weekDays = this.getWeekDays();
    let weekCompleteCount = 0;
    weekDays.forEach(day => {
      const data = this.stats.weeklyData[day.key];
      if (data && data.total > 0 && data.completed === data.total) {
        weekCompleteCount++;
      }
    });
    this.weekComplete.textContent = weekCompleteCount;

    // Render week chart
    this.renderWeekChart();
  }

  renderGoals() {
    if (this.goals.length === 0) {
      this.goalsList.innerHTML = `
        <div class="empty-state">
          <p>📝 設定今日目標</p>
          <p style="font-size:12px;margin-top:4px;">建議 3-5 個重要目標</p>
        </div>
      `;
      return;
    }

    this.goalsList.innerHTML = this.goals.map((goal, index) => `
      <div class="goal-item ${goal.completed ? 'completed' : ''}" data-index="${index}">
        <button class="goal-check">${goal.completed ? '✓' : ''}</button>
        <span class="goal-text">${this.escapeHtml(goal.text)}</span>
        <button class="goal-delete">×</button>
      </div>
    `).join('');
  }

  getWeekDays() {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Get Monday of this week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        key: this.getDateKey(date),
        label: WEEKDAYS[date.getDay()],
        isToday: this.getDateKey(date) === this.getDateKey()
      });
    }

    return days;
  }

  renderWeekChart() {
    const weekDays = this.getWeekDays();

    this.weekChart.innerHTML = weekDays.map(day => {
      const data = this.stats.weeklyData[day.key];
      let height = 4;
      let className = '';

      if (data && data.total > 0) {
        const percent = data.completed / data.total;
        height = Math.max(4, Math.round(40 * percent));

        if (percent === 1) {
          className = 'complete';
        } else if (percent > 0) {
          className = 'partial';
        }
      }

      return `
        <div class="day-bar ${day.isToday ? 'today' : ''}">
          <div class="day-fill ${className}" style="height: ${height}px"></div>
          <div class="day-label">${day.label}</div>
        </div>
      `;
    }).join('');
  }

  addGoal() {
    const text = this.goalInput.value.trim();
    if (!text || this.goals.length >= MAX_GOALS) return;

    this.goals.push({
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now()
    });

    this.goalInput.value = '';
    this.saveData();
    this.render();
  }

  toggleGoal(index) {
    if (index >= 0 && index < this.goals.length) {
      this.goals[index].completed = !this.goals[index].completed;
      this.saveData();
      this.render();
    }
  }

  deleteGoal(index) {
    if (index >= 0 && index < this.goals.length) {
      this.goals.splice(index, 1);
      this.saveData();
      this.render();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  bindEvents() {
    this.addGoalBtn.addEventListener('click', () => this.addGoal());
    this.goalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addGoal();
    });

    this.goalsList.addEventListener('click', (e) => {
      const item = e.target.closest('.goal-item');
      if (!item) return;

      const index = parseInt(item.dataset.index);

      if (e.target.closest('.goal-check')) {
        this.toggleGoal(index);
      } else if (e.target.closest('.goal-delete')) {
        this.deleteGoal(index);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DailyGoals();
});
