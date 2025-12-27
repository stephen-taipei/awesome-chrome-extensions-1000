// Budget Planner - Popup Script

class BudgetPlanner {
  constructor() {
    this.data = {
      categories: [],
      currentMonth: null
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.monthDisplayEl = document.getElementById('monthDisplay');
    this.totalBudgetEl = document.getElementById('totalBudget');
    this.totalSpentEl = document.getElementById('totalSpent');
    this.totalRemainingEl = document.getElementById('totalRemaining');
    this.progressFillEl = document.getElementById('progressFill');
    this.progressTextEl = document.getElementById('progressText');
    this.categoriesListEl = document.getElementById('categoriesList');
    this.addCategoryBtn = document.getElementById('addCategoryBtn');
    this.spendCategoryEl = document.getElementById('spendCategory');
    this.spendAmountEl = document.getElementById('spendAmount');
    this.spendBtn = document.getElementById('spendBtn');
    this.modal = document.getElementById('modal');
    this.categoryNameEl = document.getElementById('categoryName');
    this.categoryBudgetEl = document.getElementById('categoryBudget');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.addCategoryBtn.addEventListener('click', () => this.openModal());
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.saveBtn.addEventListener('click', () => this.saveCategory());
    this.spendBtn.addEventListener('click', () => this.addSpending());
    this.spendAmountEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addSpending();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('budgetPlannerData');
    if (result.budgetPlannerData) {
      this.data = result.budgetPlannerData;
    }
    this.checkMonthReset();
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ budgetPlannerData: this.data });
  }

  getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  checkMonthReset() {
    const currentMonth = this.getCurrentMonth();
    if (this.data.currentMonth !== currentMonth) {
      // Reset spending for new month
      this.data.categories.forEach(cat => {
        cat.spent = 0;
      });
      this.data.currentMonth = currentMonth;
      this.saveData();
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  openModal() {
    this.modal.classList.remove('hidden');
    this.categoryNameEl.value = '';
    this.categoryBudgetEl.value = '';
    this.categoryNameEl.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  async saveCategory() {
    const name = this.categoryNameEl.value.trim();
    const budget = parseFloat(this.categoryBudgetEl.value);

    if (!name || isNaN(budget) || budget <= 0) {
      return;
    }

    const category = {
      id: this.generateId(),
      name,
      budget,
      spent: 0
    };

    this.data.categories.push(category);
    await this.saveData();
    this.closeModal();
    this.updateUI();
  }

  async deleteCategory(id) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    await this.saveData();
    this.updateUI();
  }

  async addSpending() {
    const categoryId = this.spendCategoryEl.value;
    const amount = parseFloat(this.spendAmountEl.value);

    if (!categoryId || isNaN(amount) || amount <= 0) {
      return;
    }

    const category = this.data.categories.find(c => c.id === categoryId);
    if (category) {
      category.spent += amount;
      await this.saveData();
      this.spendAmountEl.value = '';
      this.updateUI();
    }
  }

  formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  updateUI() {
    // Update month display
    const now = new Date();
    this.monthDisplayEl.textContent = now.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    // Calculate totals
    const totalBudget = this.data.categories.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = this.data.categories.reduce((sum, c) => sum + c.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    this.totalBudgetEl.textContent = this.formatCurrency(totalBudget);
    this.totalSpentEl.textContent = this.formatCurrency(totalSpent);
    this.totalRemainingEl.textContent = this.formatCurrency(totalRemaining);
    this.totalRemainingEl.style.color = totalRemaining >= 0 ? '#22c55e' : '#ef4444';

    this.progressFillEl.style.width = `${percentage}%`;
    this.progressTextEl.textContent = `${Math.round(percentage)}%`;

    // Update categories dropdown
    this.spendCategoryEl.innerHTML = this.data.categories.map(c =>
      `<option value="${c.id}">${c.name}</option>`
    ).join('');

    // Render categories
    this.renderCategories();
  }

  renderCategories() {
    this.categoriesListEl.innerHTML = this.data.categories.map(cat => {
      const percentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
      const remaining = cat.budget - cat.spent;
      let statusClass = 'ok';
      if (percentage >= 100) statusClass = 'danger';
      else if (percentage >= 80) statusClass = 'warning';

      return `
        <div class="category-item" data-id="${cat.id}">
          <div class="category-header">
            <span class="category-name">${cat.name}</span>
            <button class="category-delete">×</button>
          </div>
          <div class="category-amounts">
            ${this.formatCurrency(cat.spent)} / ${this.formatCurrency(cat.budget)}
            (${this.formatCurrency(remaining)} left)
          </div>
          <div class="category-progress">
            <div class="category-progress-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
        </div>
      `;
    }).join('');

    this.categoriesListEl.querySelectorAll('.category-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.category-item').dataset.id;
        this.deleteCategory(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new BudgetPlanner();
});
