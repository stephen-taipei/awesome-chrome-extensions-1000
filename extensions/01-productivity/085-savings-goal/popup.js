// Savings Goal - Popup Script

class SavingsGoal {
  constructor() {
    this.data = {
      goals: [],
      activeGoalId: null
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.goalNameEl = document.getElementById('goalName');
    this.fillLevelEl = document.getElementById('fillLevel');
    this.currentAmountEl = document.getElementById('currentAmount');
    this.targetAmountEl = document.getElementById('targetAmount');
    this.percentageEl = document.getElementById('percentage');
    this.addAmountEl = document.getElementById('addAmount');
    this.addBtn = document.getElementById('addBtn');
    this.withdrawBtn = document.getElementById('withdrawBtn');
    this.newGoalBtn = document.getElementById('newGoalBtn');
    this.goalsListEl = document.getElementById('goalsList');
    this.modal = document.getElementById('modal');
    this.newGoalNameEl = document.getElementById('newGoalName');
    this.newGoalTargetEl = document.getElementById('newGoalTarget');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addSavings());
    this.withdrawBtn.addEventListener('click', () => this.withdrawSavings());
    this.newGoalBtn.addEventListener('click', () => this.openModal());
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.saveBtn.addEventListener('click', () => this.createGoal());
    this.addAmountEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSavings();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('savingsGoalData');
    if (result.savingsGoalData) {
      this.data = result.savingsGoalData;
    }
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ savingsGoalData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getActiveGoal() {
    return this.data.goals.find(g => g.id === this.data.activeGoalId);
  }

  openModal() {
    this.modal.classList.remove('hidden');
    this.newGoalNameEl.value = '';
    this.newGoalTargetEl.value = '';
    this.newGoalNameEl.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  async createGoal() {
    const name = this.newGoalNameEl.value.trim();
    const target = parseFloat(this.newGoalTargetEl.value);

    if (!name || isNaN(target) || target <= 0) {
      return;
    }

    const goal = {
      id: this.generateId(),
      name,
      target,
      current: 0,
      createdAt: Date.now()
    };

    this.data.goals.unshift(goal);
    this.data.activeGoalId = goal.id;
    await this.saveData();
    this.closeModal();
    this.updateUI();
  }

  async selectGoal(id) {
    this.data.activeGoalId = id;
    await this.saveData();
    this.updateUI();
  }

  async deleteGoal(id) {
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    if (this.data.activeGoalId === id) {
      this.data.activeGoalId = this.data.goals[0]?.id || null;
    }
    await this.saveData();
    this.updateUI();
  }

  async addSavings() {
    const amount = parseFloat(this.addAmountEl.value);
    const goal = this.getActiveGoal();

    if (!goal || isNaN(amount) || amount <= 0) {
      return;
    }

    goal.current = Math.min(goal.current + amount, goal.target * 2); // Cap at 200%
    await this.saveData();
    this.addAmountEl.value = '';
    this.updateUI();
  }

  async withdrawSavings() {
    const amount = parseFloat(this.addAmountEl.value);
    const goal = this.getActiveGoal();

    if (!goal || isNaN(amount) || amount <= 0) {
      return;
    }

    goal.current = Math.max(goal.current - amount, 0);
    await this.saveData();
    this.addAmountEl.value = '';
    this.updateUI();
  }

  formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  updateUI() {
    const goal = this.getActiveGoal();

    if (goal) {
      const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
      this.goalNameEl.textContent = goal.name;
      this.currentAmountEl.textContent = this.formatCurrency(goal.current);
      this.targetAmountEl.textContent = this.formatCurrency(goal.target);
      this.percentageEl.textContent = `${Math.round(percentage)}%`;
      this.fillLevelEl.style.height = `${Math.min(percentage, 100)}%`;
    } else {
      this.goalNameEl.textContent = 'No goal set';
      this.currentAmountEl.textContent = '$0';
      this.targetAmountEl.textContent = '$0';
      this.percentageEl.textContent = '0%';
      this.fillLevelEl.style.height = '0%';
    }

    this.renderGoals();
  }

  renderGoals() {
    this.goalsListEl.innerHTML = this.data.goals.map(goal => {
      const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
      const isActive = goal.id === this.data.activeGoalId;

      return `
        <div class="goal-item ${isActive ? 'active' : ''}" data-id="${goal.id}">
          <div class="goal-item-info">
            <div class="goal-item-name">${goal.name}</div>
            <div class="goal-item-progress">${this.formatCurrency(goal.current)} / ${this.formatCurrency(goal.target)}</div>
          </div>
          <div class="goal-item-bar">
            <div class="goal-item-fill" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <button class="goal-delete">×</button>
        </div>
      `;
    }).join('');

    this.goalsListEl.querySelectorAll('.goal-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('goal-delete')) {
          this.selectGoal(item.dataset.id);
        }
      });
    });

    this.goalsListEl.querySelectorAll('.goal-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.parentElement.dataset.id;
        this.deleteGoal(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new SavingsGoal();
});
