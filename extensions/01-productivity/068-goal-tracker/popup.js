// Goal Tracker - Popup Script

const categoryLabels = {
  personal: '個人成長',
  health: '健康',
  career: '職業',
  finance: '財務',
  learning: '學習'
};

class GoalTracker {
  constructor() {
    this.data = {
      goals: []
    };
    this.currentFilter = 'all';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.goalInput = document.getElementById('goalInput');
    this.categorySelect = document.getElementById('categorySelect');
    this.deadlineInput = document.getElementById('deadlineInput');
    this.addBtn = document.getElementById('addBtn');
    this.catTabs = document.querySelectorAll('.cat-tab');
    this.goalsList = document.getElementById('goalsList');
    this.activeGoalsEl = document.getElementById('activeGoals');
    this.completedGoalsEl = document.getElementById('completedGoals');
    this.successRateEl = document.getElementById('successRate');

    // Set default deadline to 30 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    this.deadlineInput.value = defaultDeadline.toISOString().split('T')[0];
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addGoal());
    this.goalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addGoal();
    });

    this.catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.category;
        this.renderGoals();
      });
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('goalTrackerData');
    if (result.goalTrackerData) {
      this.data = result.goalTrackerData;
    }
    this.renderGoals();
    this.updateStats();
  }

  async saveData() {
    await chrome.storage.local.set({ goalTrackerData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addGoal() {
    const title = this.goalInput.value.trim();
    if (!title) return;

    const goal = {
      id: this.generateId(),
      title,
      category: this.categorySelect.value,
      deadline: this.deadlineInput.value,
      milestones: [],
      completed: false,
      createdAt: Date.now()
    };

    this.data.goals.unshift(goal);
    await this.saveData();

    this.goalInput.value = '';
    this.renderGoals();
    this.updateStats();
  }

  async toggleGoal(id) {
    const goal = this.data.goals.find(g => g.id === id);
    if (goal) {
      goal.completed = !goal.completed;
      goal.completedAt = goal.completed ? Date.now() : null;
      await this.saveData();
      this.renderGoals();
      this.updateStats();
    }
  }

  async deleteGoal(id) {
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    await this.saveData();
    this.renderGoals();
    this.updateStats();
  }

  async addMilestone(goalId, text) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal && text.trim()) {
      goal.milestones.push({
        id: this.generateId(),
        text: text.trim(),
        completed: false
      });
      await this.saveData();
      this.renderGoals();
    }
  }

  async toggleMilestone(goalId, milestoneId) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal) {
      const milestone = goal.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        milestone.completed = !milestone.completed;
        await this.saveData();
        this.renderGoals();
      }
    }
  }

  getProgress(goal) {
    if (goal.milestones.length === 0) return goal.completed ? 100 : 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  }

  getDeadlineStatus(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { class: 'overdue', text: '已過期' };
    if (diffDays === 0) return { class: 'soon', text: '今天到期' };
    if (diffDays <= 3) return { class: 'soon', text: `${diffDays} 天後到期` };
    return { class: '', text: `${diffDays} 天後` };
  }

  renderGoals() {
    let goals = this.data.goals;

    if (this.currentFilter !== 'all') {
      goals = goals.filter(g => g.category === this.currentFilter);
    }

    // Sort: active first, then by deadline
    goals.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    this.goalsList.innerHTML = goals.map(goal => {
      const progress = this.getProgress(goal);
      const deadlineStatus = this.getDeadlineStatus(goal.deadline);

      return `
        <div class="goal-card ${goal.completed ? 'completed' : ''}" data-id="${goal.id}">
          <div class="goal-header">
            <span class="goal-title">${goal.title}</span>
            <div class="goal-actions">
              <button class="action-btn complete-btn" title="完成">${goal.completed ? '↩' : '✓'}</button>
              <button class="action-btn delete delete-btn" title="刪除">×</button>
            </div>
          </div>

          <div class="goal-meta">
            <span class="goal-category">${categoryLabels[goal.category]}</span>
            <span class="goal-deadline ${deadlineStatus.class}">${deadlineStatus.text}</span>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span>進度</span>
              <span>${progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>

          ${goal.milestones.length > 0 ? `
            <div class="milestones">
              ${goal.milestones.map(m => `
                <div class="milestone ${m.completed ? 'completed' : ''}" data-milestone="${m.id}">
                  <div class="milestone-check ${m.completed ? 'checked' : ''}">${m.completed ? '✓' : ''}</div>
                  <span>${m.text}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${!goal.completed ? `
            <div class="add-milestone">
              <input type="text" placeholder="添加里程碑..." class="milestone-input">
              <button class="add-milestone-btn">+</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Bind events
    this.goalsList.querySelectorAll('.goal-card').forEach(card => {
      const id = card.dataset.id;

      card.querySelector('.complete-btn').addEventListener('click', () => this.toggleGoal(id));
      card.querySelector('.delete-btn').addEventListener('click', () => this.deleteGoal(id));

      const milestoneInput = card.querySelector('.milestone-input');
      const addMilestoneBtn = card.querySelector('.add-milestone-btn');

      if (milestoneInput && addMilestoneBtn) {
        addMilestoneBtn.addEventListener('click', () => {
          this.addMilestone(id, milestoneInput.value);
        });
        milestoneInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.addMilestone(id, milestoneInput.value);
        });
      }

      card.querySelectorAll('.milestone').forEach(m => {
        const milestoneId = m.dataset.milestone;
        m.querySelector('.milestone-check').addEventListener('click', () => {
          this.toggleMilestone(id, milestoneId);
        });
      });
    });
  }

  updateStats() {
    const active = this.data.goals.filter(g => !g.completed).length;
    const completed = this.data.goals.filter(g => g.completed).length;
    const total = this.data.goals.length;

    this.activeGoalsEl.textContent = active;
    this.completedGoalsEl.textContent = completed;
    this.successRateEl.textContent = total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new GoalTracker();
});
