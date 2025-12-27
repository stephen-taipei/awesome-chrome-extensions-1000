// Debt Tracker - Popup Script

class DebtTracker {
  constructor() {
    this.data = {
      debts: []
    };
    this.selectedDebtId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.totalDebtEl = document.getElementById('totalDebt');
    this.totalPaidEl = document.getElementById('totalPaid');
    this.overallProgressEl = document.getElementById('overallProgress');
    this.addDebtBtn = document.getElementById('addDebtBtn');
    this.debtsListEl = document.getElementById('debtsList');

    // Add Modal
    this.addModal = document.getElementById('addModal');
    this.debtNameEl = document.getElementById('debtName');
    this.originalAmountEl = document.getElementById('originalAmount');
    this.currentBalanceEl = document.getElementById('currentBalance');
    this.cancelAddBtn = document.getElementById('cancelAddBtn');
    this.saveAddBtn = document.getElementById('saveAddBtn');

    // Payment Modal
    this.paymentModal = document.getElementById('paymentModal');
    this.paymentDebtNameEl = document.getElementById('paymentDebtName');
    this.paymentAmountEl = document.getElementById('paymentAmount');
    this.cancelPayBtn = document.getElementById('cancelPayBtn');
    this.confirmPayBtn = document.getElementById('confirmPayBtn');
  }

  bindEvents() {
    this.addDebtBtn.addEventListener('click', () => this.openAddModal());
    this.cancelAddBtn.addEventListener('click', () => this.closeAddModal());
    this.saveAddBtn.addEventListener('click', () => this.saveDebt());
    this.cancelPayBtn.addEventListener('click', () => this.closePaymentModal());
    this.confirmPayBtn.addEventListener('click', () => this.confirmPayment());
  }

  async loadData() {
    const result = await chrome.storage.local.get('debtTrackerData');
    if (result.debtTrackerData) {
      this.data = result.debtTrackerData;
    }
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ debtTrackerData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  openAddModal() {
    this.addModal.classList.remove('hidden');
    this.debtNameEl.value = '';
    this.originalAmountEl.value = '';
    this.currentBalanceEl.value = '';
    this.debtNameEl.focus();
  }

  closeAddModal() {
    this.addModal.classList.add('hidden');
  }

  async saveDebt() {
    const name = this.debtNameEl.value.trim();
    const original = parseFloat(this.originalAmountEl.value);
    const current = parseFloat(this.currentBalanceEl.value);

    if (!name || isNaN(original) || original <= 0 || isNaN(current) || current < 0) {
      return;
    }

    const debt = {
      id: this.generateId(),
      name,
      originalAmount: original,
      currentBalance: Math.min(current, original),
      createdAt: Date.now()
    };

    this.data.debts.push(debt);
    await this.saveData();
    this.closeAddModal();
    this.updateUI();
  }

  openPaymentModal(id) {
    const debt = this.data.debts.find(d => d.id === id);
    if (!debt || debt.currentBalance <= 0) return;

    this.selectedDebtId = id;
    this.paymentDebtNameEl.textContent = `${debt.name} - Balance: ${this.formatCurrency(debt.currentBalance)}`;
    this.paymentAmountEl.value = '';
    this.paymentModal.classList.remove('hidden');
    this.paymentAmountEl.focus();
  }

  closePaymentModal() {
    this.paymentModal.classList.add('hidden');
    this.selectedDebtId = null;
  }

  async confirmPayment() {
    const amount = parseFloat(this.paymentAmountEl.value);
    const debt = this.data.debts.find(d => d.id === this.selectedDebtId);

    if (!debt || isNaN(amount) || amount <= 0) {
      return;
    }

    debt.currentBalance = Math.max(debt.currentBalance - amount, 0);
    await this.saveData();
    this.closePaymentModal();
    this.updateUI();
  }

  async deleteDebt(id) {
    this.data.debts = this.data.debts.filter(d => d.id !== id);
    await this.saveData();
    this.updateUI();
  }

  calculateTotals() {
    const totalOriginal = this.data.debts.reduce((sum, d) => sum + d.originalAmount, 0);
    const totalCurrent = this.data.debts.reduce((sum, d) => sum + d.currentBalance, 0);
    const totalPaid = totalOriginal - totalCurrent;
    const progress = totalOriginal > 0 ? ((totalPaid / totalOriginal) * 100) : 0;

    return { totalOriginal, totalCurrent, totalPaid, progress };
  }

  updateUI() {
    const { totalCurrent, totalPaid, progress } = this.calculateTotals();

    this.totalDebtEl.textContent = this.formatCurrency(totalCurrent);
    this.totalPaidEl.textContent = this.formatCurrency(totalPaid);
    this.overallProgressEl.textContent = `${Math.round(progress)}%`;

    this.renderDebts();
  }

  renderDebts() {
    // Sort: active debts first, then paid off
    const sortedDebts = [...this.data.debts].sort((a, b) => {
      if (a.currentBalance === 0 && b.currentBalance > 0) return 1;
      if (a.currentBalance > 0 && b.currentBalance === 0) return -1;
      return b.createdAt - a.createdAt;
    });

    this.debtsListEl.innerHTML = sortedDebts.map(debt => {
      const paid = debt.originalAmount - debt.currentBalance;
      const progress = debt.originalAmount > 0 ? (paid / debt.originalAmount) * 100 : 0;
      const isPaidOff = debt.currentBalance === 0;

      return `
        <div class="debt-item ${isPaidOff ? 'paid-off' : ''}" data-id="${debt.id}">
          <div class="debt-header">
            <div class="debt-info">
              <div class="debt-name">${debt.name}</div>
              <div class="debt-amounts">Original: ${this.formatCurrency(debt.originalAmount)}</div>
            </div>
            <div class="debt-balance">${isPaidOff ? 'PAID!' : this.formatCurrency(debt.currentBalance)}</div>
          </div>
          <div class="debt-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">${Math.round(progress)}% paid off</div>
          </div>
          <div class="debt-actions">
            ${!isPaidOff ? `<button class="pay-btn">Make Payment</button>` : ''}
            <button class="delete-btn">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    this.debtsListEl.querySelectorAll('.pay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.debt-item').dataset.id;
        this.openPaymentModal(id);
      });
    });

    this.debtsListEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.debt-item').dataset.id;
        this.deleteDebt(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new DebtTracker();
});
