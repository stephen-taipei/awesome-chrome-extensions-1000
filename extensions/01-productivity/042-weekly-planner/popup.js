// Weekly Planner - Popup Script

class WeeklyPlanner {
  constructor() {
    this.currentWeekStart = this.getWeekStart(new Date());
    this.weekData = {};
    this.selectedDay = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.weekDaysContainer = document.getElementById('weekDays');
    this.weekRange = document.getElementById('weekRange');
    this.prevWeekBtn = document.getElementById('prevWeekBtn');
    this.nextWeekBtn = document.getElementById('nextWeekBtn');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');

    // Modal
    this.modal = document.getElementById('addModal');
    this.modalDayTitle = document.getElementById('modalDayTitle');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.taskInput = document.getElementById('taskInput');
    this.saveTaskBtn = document.getElementById('saveTaskBtn');
  }

  bindEvents() {
    this.prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
    this.nextWeekBtn.addEventListener('click', () => this.changeWeek(1));

    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.saveTaskBtn.addEventListener('click', () => this.saveTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveTask();
    });
  }

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  getWeekKey() {
    return this.currentWeekStart.toISOString().split('T')[0];
  }

  async loadData() {
    const result = await chrome.storage.local.get(['weeklyPlannerData']);
    this.weekData = result.weeklyPlannerData || {};
    this.renderWeek();
  }

  async saveData() {
    await chrome.storage.local.set({ weeklyPlannerData: this.weekData });
  }

  changeWeek(delta) {
    const newDate = new Date(this.currentWeekStart);
    newDate.setDate(newDate.getDate() + (delta * 7));
    this.currentWeekStart = newDate;
    this.renderWeek();
  }

  formatDate(date) {
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    });
  }

  getDayName(dayIndex) {
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return days[dayIndex];
  }

  renderWeek() {
    this.weekDaysContainer.innerHTML = '';

    const weekKey = this.getWeekKey();
    const weekTasks = this.weekData[weekKey] || {};

    // Week range display
    const weekEnd = new Date(this.currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    this.weekRange.textContent = `${this.formatDate(this.currentWeekStart)} - ${this.formatDate(weekEnd)}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalTasks = 0;
    let completedTasks = 0;

    // Render each day (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      const dayTasks = weekTasks[dateKey] || [];
      const isToday = date.getTime() === today.getTime();

      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter(t => t.completed).length;

      const dayCard = document.createElement('div');
      dayCard.className = `day-card ${isToday ? 'today' : ''}`;

      dayCard.innerHTML = `
        <div class="day-header">
          <div class="day-info">
            <span class="day-name">${this.getDayName(date.getDay())}</span>
            <span class="day-date">${this.formatDate(date)}</span>
            ${dayTasks.length > 0 ? `<span class="day-count">${dayTasks.filter(t => t.completed).length}/${dayTasks.length}</span>` : ''}
          </div>
          <button class="add-task-btn" data-date="${dateKey}">+</button>
        </div>
        <div class="day-tasks" data-date="${dateKey}">
          ${dayTasks.length > 0 ? dayTasks.map(task => this.renderTask(task, dateKey)).join('') : '<div class="empty-day">沒有任務</div>'}
        </div>
      `;

      // Add task button
      const addBtn = dayCard.querySelector('.add-task-btn');
      addBtn.addEventListener('click', () => this.openModal(dateKey, date));

      this.weekDaysContainer.appendChild(dayCard);
    }

    // Bind task events
    this.bindTaskEvents();

    // Update progress
    this.updateProgress(completedTasks, totalTasks);
  }

  renderTask(task, dateKey) {
    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <button class="task-check" data-date="${dateKey}" data-id="${task.id}">
          ${task.completed ? '✓' : ''}
        </button>
        <span class="task-text">${this.escapeHtml(task.text)}</span>
        <button class="task-delete" data-date="${dateKey}" data-id="${task.id}">✕</button>
      </div>
    `;
  }

  bindTaskEvents() {
    // Check buttons
    document.querySelectorAll('.task-check').forEach(btn => {
      btn.addEventListener('click', () => {
        const { date, id } = btn.dataset;
        this.toggleTask(date, id);
      });
    });

    // Delete buttons
    document.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const { date, id } = btn.dataset;
        this.deleteTask(date, id);
      });
    });
  }

  openModal(dateKey, date) {
    this.selectedDay = dateKey;
    this.modalDayTitle.textContent = `${this.getDayName(date.getDay())} ${this.formatDate(date)}`;
    this.taskInput.value = '';
    this.modal.classList.remove('hidden');
    this.taskInput.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.selectedDay = null;
  }

  async saveTask() {
    const text = this.taskInput.value.trim();
    if (!text || !this.selectedDay) return;

    const weekKey = this.getWeekKey();
    if (!this.weekData[weekKey]) {
      this.weekData[weekKey] = {};
    }
    if (!this.weekData[weekKey][this.selectedDay]) {
      this.weekData[weekKey][this.selectedDay] = [];
    }

    this.weekData[weekKey][this.selectedDay].push({
      id: Date.now().toString(),
      text,
      completed: false
    });

    await this.saveData();
    this.renderWeek();
    this.closeModal();
  }

  async toggleTask(dateKey, taskId) {
    const weekKey = this.getWeekKey();
    const dayTasks = this.weekData[weekKey]?.[dateKey];
    if (!dayTasks) return;

    const task = dayTasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      await this.saveData();
      this.renderWeek();
    }
  }

  async deleteTask(dateKey, taskId) {
    const weekKey = this.getWeekKey();
    const dayTasks = this.weekData[weekKey]?.[dateKey];
    if (!dayTasks) return;

    const index = dayTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      dayTasks.splice(index, 1);
      await this.saveData();
      this.renderWeek();
    }
  }

  updateProgress(completed, total) {
    const percent = total > 0 ? (completed / total) * 100 : 0;
    this.progressFill.style.width = `${percent}%`;
    this.progressText.textContent = `${completed} / ${total} 完成`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new WeeklyPlanner();
});
