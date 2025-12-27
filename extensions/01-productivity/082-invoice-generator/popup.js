// Invoice Generator - Popup Script

class InvoiceGenerator {
  constructor() {
    this.data = {
      invoices: [],
      nextNumber: 1
    };
    this.currentItems = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaultDate();
  }

  initElements() {
    this.invoiceNumberEl = document.getElementById('invoiceNumber');
    this.clientNameEl = document.getElementById('clientName');
    this.invoiceDateEl = document.getElementById('invoiceDate');
    this.itemsListEl = document.getElementById('itemsList');
    this.addItemBtn = document.getElementById('addItemBtn');
    this.taxRateEl = document.getElementById('taxRate');
    this.subtotalEl = document.getElementById('subtotal');
    this.taxAmountEl = document.getElementById('taxAmount');
    this.grandTotalEl = document.getElementById('grandTotal');
    this.previewBtn = document.getElementById('previewBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.invoicesListEl = document.getElementById('invoicesList');
  }

  bindEvents() {
    this.addItemBtn.addEventListener('click', () => this.addItem());
    this.taxRateEl.addEventListener('input', () => this.calculateTotals());
    this.previewBtn.addEventListener('click', () => this.previewInvoice());
    this.saveBtn.addEventListener('click', () => this.saveInvoice());
  }

  async loadData() {
    const result = await chrome.storage.local.get('invoiceGeneratorData');
    if (result.invoiceGeneratorData) {
      this.data = result.invoiceGeneratorData;
    }
    this.invoiceNumberEl.value = `INV-${String(this.data.nextNumber).padStart(3, '0')}`;
    this.addItem(); // Start with one empty item
    this.renderInvoices();
  }

  async saveData() {
    await chrome.storage.local.set({ invoiceGeneratorData: this.data });
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    this.invoiceDateEl.value = today;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  addItem(item = null) {
    const id = this.generateId();
    const itemData = item || { id, description: '', quantity: 1, price: 0 };

    if (!item) {
      this.currentItems.push(itemData);
    }

    const itemEl = document.createElement('div');
    itemEl.className = 'item-row';
    itemEl.dataset.id = itemData.id;
    itemEl.innerHTML = `
      <input type="text" class="item-desc" placeholder="Description" value="${itemData.description}">
      <input type="number" class="item-qty" placeholder="Qty" value="${itemData.quantity}" min="1">
      <input type="number" class="item-price" placeholder="Price" value="${itemData.price}" min="0" step="0.01">
      <span class="item-total">$${(itemData.quantity * itemData.price).toFixed(2)}</span>
      <button class="remove-btn">×</button>
    `;

    const descInput = itemEl.querySelector('.item-desc');
    const qtyInput = itemEl.querySelector('.item-qty');
    const priceInput = itemEl.querySelector('.item-price');
    const removeBtn = itemEl.querySelector('.remove-btn');

    const updateItem = () => {
      const idx = this.currentItems.findIndex(i => i.id === itemData.id);
      if (idx !== -1) {
        this.currentItems[idx].description = descInput.value;
        this.currentItems[idx].quantity = parseInt(qtyInput.value) || 0;
        this.currentItems[idx].price = parseFloat(priceInput.value) || 0;
        const total = this.currentItems[idx].quantity * this.currentItems[idx].price;
        itemEl.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
        this.calculateTotals();
      }
    };

    descInput.addEventListener('input', updateItem);
    qtyInput.addEventListener('input', updateItem);
    priceInput.addEventListener('input', updateItem);

    removeBtn.addEventListener('click', () => {
      this.currentItems = this.currentItems.filter(i => i.id !== itemData.id);
      itemEl.remove();
      this.calculateTotals();
    });

    this.itemsListEl.appendChild(itemEl);
  }

  calculateTotals() {
    const subtotal = this.currentItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    const taxRate = parseFloat(this.taxRateEl.value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    this.subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    this.taxAmountEl.textContent = `$${taxAmount.toFixed(2)}`;
    this.grandTotalEl.textContent = `$${grandTotal.toFixed(2)}`;

    return { subtotal, taxAmount, grandTotal };
  }

  previewInvoice() {
    const { grandTotal } = this.calculateTotals();
    const invoiceNumber = this.invoiceNumberEl.value;
    const clientName = this.clientNameEl.value || 'Client';
    const date = this.invoiceDateEl.value;

    const previewHtml = `
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .title { font-size: 32px; font-weight: bold; color: #1d4ed8; }
          .invoice-info { text-align: right; }
          .client { margin-bottom: 30px; }
          .client-label { font-size: 12px; color: #666; }
          .client-name { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .text-right { text-align: right; }
          .totals { float: right; width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-size: 18px; font-weight: bold; color: #1d4ed8; border-top: 2px solid #1d4ed8; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">INVOICE</div>
          <div class="invoice-info">
            <div>${invoiceNumber}</div>
            <div>${date}</div>
          </div>
        </div>
        <div class="client">
          <div class="client-label">BILL TO</div>
          <div class="client-name">${clientName}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.currentItems.filter(i => i.description).map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">$${item.price.toFixed(2)}</td>
                <td class="text-right">$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${this.subtotalEl.textContent}</span>
          </div>
          <div class="total-row">
            <span>Tax (${this.taxRateEl.value}%)</span>
            <span>${this.taxAmountEl.textContent}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>${this.grandTotalEl.textContent}</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    chrome.tabs.create({ url });
  }

  async saveInvoice() {
    const { subtotal, taxAmount, grandTotal } = this.calculateTotals();
    const invoiceNumber = this.invoiceNumberEl.value;
    const clientName = this.clientNameEl.value.trim();

    if (!clientName || this.currentItems.length === 0) {
      this.saveBtn.textContent = 'Fill required!';
      setTimeout(() => {
        this.saveBtn.textContent = 'Save';
      }, 1500);
      return;
    }

    const invoice = {
      id: this.generateId(),
      number: invoiceNumber,
      client: clientName,
      date: this.invoiceDateEl.value,
      items: [...this.currentItems],
      taxRate: parseFloat(this.taxRateEl.value) || 0,
      subtotal,
      taxAmount,
      total: grandTotal,
      createdAt: Date.now()
    };

    this.data.invoices.unshift(invoice);
    this.data.nextNumber++;
    await this.saveData();

    // Reset form
    this.invoiceNumberEl.value = `INV-${String(this.data.nextNumber).padStart(3, '0')}`;
    this.clientNameEl.value = '';
    this.setDefaultDate();
    this.currentItems = [];
    this.itemsListEl.innerHTML = '';
    this.addItem();
    this.calculateTotals();

    this.renderInvoices();
  }

  async deleteInvoice(id) {
    this.data.invoices = this.data.invoices.filter(i => i.id !== id);
    await this.saveData();
    this.renderInvoices();
  }

  renderInvoices() {
    const recent = this.data.invoices.slice(0, 5);

    this.invoicesListEl.innerHTML = recent.map(inv => `
      <div class="invoice-item" data-id="${inv.id}">
        <div class="invoice-info">
          <div class="invoice-number">${inv.number}</div>
          <div class="invoice-client">${inv.client} • ${inv.date}</div>
        </div>
        <span class="invoice-total">$${inv.total.toFixed(2)}</span>
        <button class="invoice-delete">×</button>
      </div>
    `).join('');

    this.invoicesListEl.querySelectorAll('.invoice-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteInvoice(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new InvoiceGenerator();
});
