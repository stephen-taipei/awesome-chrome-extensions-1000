// Expense Tracker - Popup Script

const categoryIcons = {
  food: '🍔',
  transport: '🚌',
  shopping: '🛒',
  entertainment: '🎮',
  bills: '📄',
  income: '💵',
  other: '📌'
};

class ExpenseTracker {
  constructor() {
    this.data = {
      transactions: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.balanceEl = document.getElementById('balance');
    this.totalIncomeEl = document.getElementById('totalIncome');
    this.totalExpenseEl = document.getElementById('totalExpense');
    this.descriptionEl = document.getElementById('description');
    this.amountEl = document.getElementById('amount');
    this.categoryEl = document.getElementById('category');
    this.addBtn = document.getElementById('addBtn');
    this.transactionsList = document.getElementById('transactionsList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTransaction());
    this.descriptionEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTransaction();
    });
    this.amountEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTransaction();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('expenseTrackerData');
    if (result.expenseTrackerData) {
      this.data = result.expenseTrackerData;
    }
    this.cleanupOldTransactions();
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ expenseTrackerData: this.data });
  }

  cleanupOldTransactions() {
    // Keep transactions from current month only for balance calculation
    // But keep last 30 days for display
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.data.transactions = this.data.transactions.filter(t => t.createdAt > thirtyDaysAgo);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addTransaction() {
    const description = this.descriptionEl.value.trim();
    const amount = parseFloat(this.amountEl.value);
    const category = this.categoryEl.value;

    if (!description || isNaN(amount) || amount <= 0) {
      this.addBtn.textContent = '請填寫完整';
      setTimeout(() => {
        this.addBtn.textContent = '添加';
      }, 1500);
      return;
    }

    const isIncome = category === 'income';

    const transaction = {
      id: this.generateId(),
      description,
      amount,
      category,
      type: isIncome ? 'income' : 'expense',
      createdAt: Date.now()
    };

    this.data.transactions.unshift(transaction);
    await this.saveData();

    this.descriptionEl.value = '';
    this.amountEl.value = '';

    this.updateUI();
  }

  async deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    await this.saveData();
    this.updateUI();
  }

  getMonthTransactions() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return this.data.transactions.filter(t => t.createdAt >= monthStart);
  }

  calculateTotals() {
    const monthTransactions = this.getMonthTransactions();

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }

  formatCurrency(amount) {
    return '$' + amount.toLocaleString('zh-TW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  updateUI() {
    const { income, expense, balance } = this.calculateTotals();

    this.balanceEl.textContent = this.formatCurrency(balance);
    this.balanceEl.style.color = balance >= 0 ? '#22c55e' : '#ef4444';
    this.totalIncomeEl.textContent = '+' + this.formatCurrency(income);
    this.totalExpenseEl.textContent = '-' + this.formatCurrency(expense);

    this.renderTransactions();
  }

  renderTransactions() {
    const recent = this.data.transactions.slice(0, 10);

    this.transactionsList.innerHTML = recent.map(t => `
      <div class="transaction-item ${t.type}" data-id="${t.id}">
        <span class="transaction-icon">${categoryIcons[t.category]}</span>
        <div class="transaction-info">
          <div class="transaction-desc">${t.description}</div>
          <div class="transaction-date">${this.formatDate(t.createdAt)}</div>
        </div>
        <span class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}</span>
        <button class="transaction-delete">×</button>
      </div>
    `).join('');

    this.transactionsList.querySelectorAll('.transaction-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteTransaction(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ExpenseTracker();
});
