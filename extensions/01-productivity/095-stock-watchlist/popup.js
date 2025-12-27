// Stock Watchlist - Popup Script

class StockWatchlist {
  constructor() {
    this.data = { stocks: [] };
    this.editingId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.totalValueEl = document.getElementById('totalValue');
    this.totalChangeEl = document.getElementById('totalChange');
    this.symbolEl = document.getElementById('symbol');
    this.sharesEl = document.getElementById('shares');
    this.buyPriceEl = document.getElementById('buyPrice');
    this.currentPriceEl = document.getElementById('currentPrice');
    this.addBtn = document.getElementById('addBtn');
    this.stocksListEl = document.getElementById('stocksList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addOrUpdateStock());
    this.symbolEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addOrUpdateStock();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('stockWatchlistData');
    if (result.stockWatchlistData) {
      this.data = result.stockWatchlistData;
    }
    this.updateSummary();
    this.renderStocks();
  }

  async saveData() {
    await chrome.storage.local.set({ stockWatchlistData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addOrUpdateStock() {
    const symbol = this.symbolEl.value.trim().toUpperCase();
    const shares = parseFloat(this.sharesEl.value);
    const buyPrice = parseFloat(this.buyPriceEl.value);
    const currentPrice = parseFloat(this.currentPriceEl.value);

    if (!symbol || isNaN(shares) || shares <= 0 || isNaN(buyPrice) || isNaN(currentPrice)) {
      this.addBtn.textContent = '!';
      setTimeout(() => this.addBtn.textContent = '+', 1000);
      return;
    }

    if (this.editingId) {
      const stock = this.data.stocks.find(s => s.id === this.editingId);
      if (stock) {
        stock.symbol = symbol;
        stock.shares = shares;
        stock.buyPrice = buyPrice;
        stock.currentPrice = currentPrice;
        stock.updatedAt = Date.now();
      }
      this.editingId = null;
    } else {
      const stock = {
        id: this.generateId(),
        symbol,
        shares,
        buyPrice,
        currentPrice,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.data.stocks.push(stock);
    }

    await this.saveData();
    this.clearForm();
    this.updateSummary();
    this.renderStocks();
  }

  clearForm() {
    this.symbolEl.value = '';
    this.sharesEl.value = '';
    this.buyPriceEl.value = '';
    this.currentPriceEl.value = '';
    this.addBtn.textContent = '+';
  }

  editStock(id) {
    const stock = this.data.stocks.find(s => s.id === id);
    if (stock) {
      this.editingId = id;
      this.symbolEl.value = stock.symbol;
      this.sharesEl.value = stock.shares;
      this.buyPriceEl.value = stock.buyPrice;
      this.currentPriceEl.value = stock.currentPrice;
      this.addBtn.textContent = '✓';
      this.symbolEl.focus();
    }
  }

  async deleteStock(id) {
    this.data.stocks = this.data.stocks.filter(s => s.id !== id);
    await this.saveData();
    this.updateSummary();
    this.renderStocks();
  }

  formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatPercent(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  updateSummary() {
    let totalValue = 0;
    let totalCost = 0;

    this.data.stocks.forEach(stock => {
      totalValue += stock.shares * stock.currentPrice;
      totalCost += stock.shares * stock.buyPrice;
    });

    const totalChange = totalValue - totalCost;
    const changePercent = totalCost > 0 ? ((totalChange / totalCost) * 100) : 0;

    this.totalValueEl.textContent = this.formatCurrency(totalValue);
    this.totalChangeEl.textContent = `${this.formatCurrency(totalChange)} (${this.formatPercent(changePercent)})`;
    this.totalChangeEl.className = `summary-change ${totalChange >= 0 ? 'positive' : 'negative'}`;
  }

  renderStocks() {
    this.stocksListEl.innerHTML = this.data.stocks.map(stock => {
      const value = stock.shares * stock.currentPrice;
      const cost = stock.shares * stock.buyPrice;
      const change = stock.currentPrice - stock.buyPrice;
      const changePercent = stock.buyPrice > 0 ? ((change / stock.buyPrice) * 100) : 0;
      const isPositive = change >= 0;

      return `
        <div class="stock-item" data-id="${stock.id}">
          <div class="stock-symbol">${stock.symbol}</div>
          <div class="stock-info">
            <div class="stock-shares">${stock.shares} shares</div>
            <div class="stock-value">Value: ${this.formatCurrency(value)}</div>
          </div>
          <div class="stock-price">
            <div class="stock-current">${this.formatCurrency(stock.currentPrice)}</div>
            <div class="stock-change ${isPositive ? 'positive' : 'negative'}">${this.formatPercent(changePercent)}</div>
          </div>
          <div class="stock-actions">
            <button class="stock-edit">✏️</button>
            <button class="stock-delete">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    this.stocksListEl.querySelectorAll('.stock-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.stock-item').dataset.id;
        this.editStock(id);
      });
    });

    this.stocksListEl.querySelectorAll('.stock-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.stock-item').dataset.id;
        this.deleteStock(id);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new StockWatchlist());
