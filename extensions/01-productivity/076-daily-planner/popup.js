// Daily Planner - Popup Script

class DailyPlanner {
  constructor() {
    this.data = {
      days: {}
    };
    this.currentDate = new Date();
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.prevDayBtn = document.getElementById('prevDay');
    this.nextDayBtn = document.getElementById('nextDay');
    this.currentDateEl = document.getElementById('currentDate');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.timeBlocks = document.getElementById('timeBlocks');
    this.taskInput = document.getElementById('taskInput');
    this.startTime = document.getElementById('startTime');
    this.duration = document.getElementById('duration');
    this.addBtn = document.getElementById('addBtn');
  }

  bindEvents() {
    this.prevDayBtn.addEventListener('click', () => this.changeDay(-1));
    this.nextDayBtn.addEventListener('click', () => this.changeDay(1));
    this.addBtn.addEventListener('click', () => this.addBlock());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addBlock();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('dailyPlannerData');
    if (result.dailyPlannerData) {
      this.data = result.dailyPlannerData;
    }
    this.updateDateDisplay();
    this.renderBlocks();
  }

  async saveData() {
    await chrome.storage.local.set({ dailyPlannerData: this.data });
  }

  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  changeDay(delta) {
    this.currentDate.setDate(this.currentDate.getDate() + delta);
    this.updateDateDisplay();
    this.renderBlocks();
  }

  updateDateDisplay() {
    const today = new Date();
    const isToday = this.getDateKey(this.currentDate) === this.getDateKey(today);

    let dateText = this.currentDate.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });

    if (isToday) dateText += ' (今天)';

    this.currentDateEl.textContent = dateText;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getDayBlocks() {
    const key = this.getDateKey(this.currentDate);
    return this.data.days[key] || [];
  }

  async addBlock() {
    const task = this.taskInput.value.trim();
    if (!task) return;

    const key = this.getDateKey(this.currentDate);
    if (!this.data.days[key]) {
      this.data.days[key] = [];
    }

    const block = {
      id: this.generateId(),
      task,
      startTime: this.startTime.value,
      duration: parseInt(this.duration.value),
      completed: false,
      createdAt: Date.now()
    };

    this.data.days[key].push(block);

    // Sort by start time
    this.data.days[key].sort((a, b) => a.startTime.localeCompare(b.startTime));

    await this.saveData();

    this.taskInput.value = '';
    this.renderBlocks();
  }

  async toggleBlock(id) {
    const key = this.getDateKey(this.currentDate);
    const block = this.data.days[key]?.find(b => b.id === id);
    if (block) {
      block.completed = !block.completed;
      await this.saveData();
      this.renderBlocks();
    }
  }

  async deleteBlock(id) {
    const key = this.getDateKey(this.currentDate);
    if (this.data.days[key]) {
      this.data.days[key] = this.data.days[key].filter(b => b.id !== id);
      await this.saveData();
      this.renderBlocks();
    }
  }

  formatDuration(minutes) {
    if (minutes < 60) return `${minutes}分`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}m` : `${hours}小時`;
  }

  updateProgress() {
    const blocks = this.getDayBlocks();
    if (blocks.length === 0) {
      this.progressFill.style.width = '0%';
      this.progressText.textContent = '0% 完成';
      return;
    }

    const completed = blocks.filter(b => b.completed).length;
    const percent = Math.round((completed / blocks.length) * 100);

    this.progressFill.style.width = `${percent}%`;
    this.progressText.textContent = `${percent}% 完成`;
  }

  renderBlocks() {
    const blocks = this.getDayBlocks();

    this.timeBlocks.innerHTML = blocks.map(block => `
      <div class="time-block ${block.completed ? 'completed' : ''}" data-id="${block.id}">
        <div class="block-time">
          <span class="block-start">${block.startTime}</span>
          <span class="block-duration">${this.formatDuration(block.duration)}</span>
        </div>
        <div class="block-content">
          <div class="block-check ${block.completed ? 'checked' : ''}">${block.completed ? '✓' : ''}</div>
          <span class="block-task">${block.task}</span>
          <button class="block-delete">×</button>
        </div>
      </div>
    `).join('');

    // Bind events
    this.timeBlocks.querySelectorAll('.time-block').forEach(blockEl => {
      const id = blockEl.dataset.id;

      blockEl.querySelector('.block-check').addEventListener('click', () => this.toggleBlock(id));
      blockEl.querySelector('.block-delete').addEventListener('click', () => this.deleteBlock(id));
    });

    this.updateProgress();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new DailyPlanner();
});
