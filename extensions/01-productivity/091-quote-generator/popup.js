// Quote Generator - Popup Script

class QuoteGenerator {
  constructor() {
    this.data = {
      quotes: [],
      nextNumber: 1
    };
    this.currentItems = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaults();
  }

  initElements() {
    this.quoteNumberEl = document.getElementById('quoteNumber');
    this.validUntilEl = document.getElementById('validUntil');
    this.clientNameEl = document.getElementById('clientName');
    this.itemsListEl = document.getElementById('itemsList');
    this.addItemBtn = document.getElementById('addItemBtn');
    this.discountEl = document.getElementById('discount');
    this.subtotalEl = document.getElementById('subtotal');
    this.grandTotalEl = document.getElementById('grandTotal');
    this.previewBtn = document.getElementById('previewBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.quotesListEl = document.getElementById('quotesList');
  }

  bindEvents() {
    this.addItemBtn.addEventListener('click', () => this.addItem());
    this.discountEl.addEventListener('input', () => this.calculateTotals());
    this.previewBtn.addEventListener('click', () => this.previewQuote());
    this.saveBtn.addEventListener('click', () => this.saveQuote());
  }

  async loadData() {
    const result = await chrome.storage.local.get('quoteGeneratorData');
    if (result.quoteGeneratorData) {
      this.data = result.quoteGeneratorData;
    }
    this.quoteNumberEl.value = `Q-${String(this.data.nextNumber).padStart(3, '0')}`;
    this.addItem();
    this.renderQuotes();
  }

  async saveData() {
    await chrome.storage.local.set({ quoteGeneratorData: this.data });
  }

  setDefaults() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    this.validUntilEl.value = date.toISOString().split('T')[0];
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

    const inputs = {
      desc: itemEl.querySelector('.item-desc'),
      qty: itemEl.querySelector('.item-qty'),
      price: itemEl.querySelector('.item-price')
    };

    const updateItem = () => {
      const idx = this.currentItems.findIndex(i => i.id === itemData.id);
      if (idx !== -1) {
        this.currentItems[idx].description = inputs.desc.value;
        this.currentItems[idx].quantity = parseInt(inputs.qty.value) || 0;
        this.currentItems[idx].price = parseFloat(inputs.price.value) || 0;
        const total = this.currentItems[idx].quantity * this.currentItems[idx].price;
        itemEl.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
        this.calculateTotals();
      }
    };

    Object.values(inputs).forEach(input => input.addEventListener('input', updateItem));

    itemEl.querySelector('.remove-btn').addEventListener('click', () => {
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

    const discount = parseFloat(this.discountEl.value) || 0;
    const discountAmount = subtotal * (discount / 100);
    const grandTotal = subtotal - discountAmount;

    this.subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    this.grandTotalEl.textContent = `$${grandTotal.toFixed(2)}`;

    return { subtotal, discountAmount, grandTotal };
  }

  previewQuote() {
    const { subtotal, discountAmount, grandTotal } = this.calculateTotals();
    const quoteNumber = this.quoteNumberEl.value;
    const clientName = this.clientNameEl.value || 'Client';
    const validUntil = this.validUntilEl.value;
    const discount = parseFloat(this.discountEl.value) || 0;

    const html = `
      <html>
      <head>
        <title>Quote ${quoteNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .title { font-size: 32px; font-weight: bold; color: #9333ea; }
          .quote-info { text-align: right; }
          .client { margin-bottom: 30px; }
          .label { font-size: 12px; color: #666; text-transform: uppercase; }
          .client-name { font-size: 20px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #faf5ff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #9333ea; }
          td { padding: 12px; border-bottom: 1px solid #f3e8ff; }
          .text-right { text-align: right; }
          .totals { float: right; width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-size: 20px; font-weight: bold; color: #9333ea; border-top: 2px solid #9333ea; padding-top: 12px; margin-top: 8px; }
          .validity { margin-top: 40px; padding: 20px; background: #faf5ff; border-radius: 8px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">QUOTE</div>
          <div class="quote-info">
            <div style="font-weight: bold; color: #9333ea;">${quoteNumber}</div>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div class="client">
          <div class="label">Prepared For</div>
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
          <div class="total-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          ${discount > 0 ? `<div class="total-row"><span>Discount (${discount}%)</span><span>-$${discountAmount.toFixed(2)}</span></div>` : ''}
          <div class="total-row grand-total"><span>Total</span><span>$${grandTotal.toFixed(2)}</span></div>
        </div>
        <div style="clear: both;"></div>
        <div class="validity">Quote valid until: <strong>${validUntil}</strong></div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    chrome.tabs.create({ url });
  }

  async saveQuote() {
    const { grandTotal } = this.calculateTotals();
    const clientName = this.clientNameEl.value.trim();

    if (!clientName || this.currentItems.length === 0) {
      this.saveBtn.textContent = 'Fill required!';
      setTimeout(() => this.saveBtn.textContent = 'Save', 1500);
      return;
    }

    const quote = {
      id: this.generateId(),
      number: this.quoteNumberEl.value,
      client: clientName,
      validUntil: this.validUntilEl.value,
      items: [...this.currentItems],
      discount: parseFloat(this.discountEl.value) || 0,
      total: grandTotal,
      createdAt: Date.now()
    };

    this.data.quotes.unshift(quote);
    this.data.nextNumber++;
    await this.saveData();

    this.quoteNumberEl.value = `Q-${String(this.data.nextNumber).padStart(3, '0')}`;
    this.clientNameEl.value = '';
    this.currentItems = [];
    this.itemsListEl.innerHTML = '';
    this.addItem();
    this.setDefaults();
    this.calculateTotals();
    this.renderQuotes();
  }

  async deleteQuote(id) {
    this.data.quotes = this.data.quotes.filter(q => q.id !== id);
    await this.saveData();
    this.renderQuotes();
  }

  renderQuotes() {
    const recent = this.data.quotes.slice(0, 5);
    this.quotesListEl.innerHTML = recent.map(q => `
      <div class="quote-item" data-id="${q.id}">
        <div class="quote-info">
          <div class="quote-number">${q.number}</div>
          <div class="quote-client">${q.client}</div>
        </div>
        <span class="quote-total">$${q.total.toFixed(2)}</span>
        <button class="quote-delete">×</button>
      </div>
    `).join('');

    this.quotesListEl.querySelectorAll('.quote-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteQuote(btn.parentElement.dataset.id);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new QuoteGenerator());
