// Receipt Scanner - Popup Script

const categoryIcons = {
  grocery: '🛒',
  restaurant: '🍽️',
  gas: '⛽',
  shopping: '🛍️',
  medical: '💊',
  utilities: '💡',
  other: '📌'
};

class ReceiptScanner {
  constructor() {
    this.data = {
      receipts: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaultDate();
  }

  initElements() {
    this.storeNameEl = document.getElementById('storeName');
    this.amountEl = document.getElementById('amount');
    this.categoryEl = document.getElementById('category');
    this.receiptDateEl = document.getElementById('receiptDate');
    this.notesEl = document.getElementById('notes');
    this.addBtn = document.getElementById('addBtn');
    this.filterCategoryEl = document.getElementById('filterCategory');
    this.receiptsListEl = document.getElementById('receiptsList');
    this.totalReceiptsEl = document.getElementById('totalReceipts');
    this.totalAmountEl = document.getElementById('totalAmount');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addReceipt());
    this.filterCategoryEl.addEventListener('change', () => this.renderReceipts());
    this.storeNameEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addReceipt();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('receiptScannerData');
    if (result.receiptScannerData) {
      this.data = result.receiptScannerData;
    }
    this.updateStats();
    this.renderReceipts();
  }

  async saveData() {
    await chrome.storage.local.set({ receiptScannerData: this.data });
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    this.receiptDateEl.value = today;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addReceipt() {
    const storeName = this.storeNameEl.value.trim();
    const amount = parseFloat(this.amountEl.value);
    const category = this.categoryEl.value;
    const date = this.receiptDateEl.value;
    const notes = this.notesEl.value.trim();

    if (!storeName || isNaN(amount) || amount <= 0) {
      this.addBtn.textContent = 'Fill required!';
      setTimeout(() => {
        this.addBtn.textContent = 'Save Receipt';
      }, 1500);
      return;
    }

    const receipt = {
      id: this.generateId(),
      storeName,
      amount,
      category,
      date,
      notes,
      createdAt: Date.now()
    };

    this.data.receipts.unshift(receipt);
    await this.saveData();

    // Reset form
    this.storeNameEl.value = '';
    this.amountEl.value = '';
    this.notesEl.value = '';
    this.setDefaultDate();

    this.updateStats();
    this.renderReceipts();
  }

  async deleteReceipt(id) {
    this.data.receipts = this.data.receipts.filter(r => r.id !== id);
    await this.saveData();
    this.updateStats();
    this.renderReceipts();
  }

  getMonthReceipts() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.data.receipts.filter(r => new Date(r.date) >= monthStart);
  }

  updateStats() {
    const monthReceipts = this.getMonthReceipts();
    const totalAmount = monthReceipts.reduce((sum, r) => sum + r.amount, 0);

    this.totalReceiptsEl.textContent = this.data.receipts.length;
    this.totalAmountEl.textContent = '$' + totalAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  renderReceipts() {
    const filterCategory = this.filterCategoryEl.value;
    let receipts = this.data.receipts;

    if (filterCategory !== 'all') {
      receipts = receipts.filter(r => r.category === filterCategory);
    }

    const recent = receipts.slice(0, 15);

    this.receiptsListEl.innerHTML = recent.map(r => `
      <div class="receipt-item" data-id="${r.id}">
        <span class="receipt-icon">${categoryIcons[r.category]}</span>
        <div class="receipt-info">
          <div class="receipt-store">${r.storeName}</div>
          <div class="receipt-meta">${this.formatDate(r.date)}${r.notes ? ' • ' + r.notes.substring(0, 20) : ''}</div>
        </div>
        <span class="receipt-amount">$${r.amount.toFixed(2)}</span>
        <button class="receipt-delete">×</button>
      </div>
    `).join('');

    this.receiptsListEl.querySelectorAll('.receipt-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteReceipt(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ReceiptScanner();
});
