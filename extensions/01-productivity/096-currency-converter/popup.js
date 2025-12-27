// Currency Converter - Popup Script

const DEFAULT_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  TWD: 31.50,
  KRW: 1320,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  TWD: 'Taiwan Dollar',
  KRW: 'Korean Won',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  HKD: 'Hong Kong Dollar',
  SGD: 'Singapore Dollar'
};

class CurrencyConverter {
  constructor() {
    this.data = {
      rates: { ...DEFAULT_RATES },
      history: [],
      lastFrom: 'USD',
      lastTo: 'EUR'
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.fromAmountEl = document.getElementById('fromAmount');
    this.fromCurrencyEl = document.getElementById('fromCurrency');
    this.toAmountEl = document.getElementById('toAmount');
    this.toCurrencyEl = document.getElementById('toCurrency');
    this.swapBtn = document.getElementById('swapBtn');
    this.rateTextEl = document.getElementById('rateText');
    this.quickBtns = document.querySelectorAll('.quick-btn');
    this.historyListEl = document.getElementById('historyList');
    this.modal = document.getElementById('modal');
    this.rateInfoEl = document.getElementById('rateInfo');
    this.rateInputEl = document.getElementById('rateInput');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.fromAmountEl.addEventListener('input', () => this.convert());
    this.fromCurrencyEl.addEventListener('change', () => this.convert());
    this.toCurrencyEl.addEventListener('change', () => this.convert());
    this.swapBtn.addEventListener('click', () => this.swap());
    this.rateTextEl.addEventListener('click', () => this.openRateModal());
    this.quickBtns.forEach(btn => {
      btn.addEventListener('click', () => this.quickConvert(btn.dataset.amount));
    });
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.saveBtn.addEventListener('click', () => this.saveRate());
  }

  async loadData() {
    const result = await chrome.storage.local.get('currencyConverterData');
    if (result.currencyConverterData) {
      this.data = { ...this.data, ...result.currencyConverterData };
    }
    this.populateCurrencies();
    this.fromCurrencyEl.value = this.data.lastFrom;
    this.toCurrencyEl.value = this.data.lastTo;
    this.convert();
    this.renderHistory();
  }

  async saveData() {
    await chrome.storage.local.set({ currencyConverterData: this.data });
  }

  populateCurrencies() {
    const currencies = Object.keys(this.data.rates);
    const options = currencies.map(c => `<option value="${c}">${c}</option>`).join('');
    this.fromCurrencyEl.innerHTML = options;
    this.toCurrencyEl.innerHTML = options;
  }

  convert() {
    const amount = parseFloat(this.fromAmountEl.value) || 0;
    const from = this.fromCurrencyEl.value;
    const to = this.toCurrencyEl.value;

    // Convert to USD first, then to target
    const inUSD = amount / this.data.rates[from];
    const result = inUSD * this.data.rates[to];

    this.toAmountEl.value = result.toFixed(2);
    this.updateRateDisplay();

    // Save last used
    this.data.lastFrom = from;
    this.data.lastTo = to;
    this.saveData();
  }

  updateRateDisplay() {
    const from = this.fromCurrencyEl.value;
    const to = this.toCurrencyEl.value;
    const rate = (this.data.rates[to] / this.data.rates[from]).toFixed(4);
    this.rateTextEl.textContent = `1 ${from} = ${rate} ${to} (click to edit)`;
  }

  swap() {
    const tempCurrency = this.fromCurrencyEl.value;
    this.fromCurrencyEl.value = this.toCurrencyEl.value;
    this.toCurrencyEl.value = tempCurrency;

    const tempAmount = this.fromAmountEl.value;
    this.fromAmountEl.value = this.toAmountEl.value;

    this.convert();
  }

  quickConvert(amount) {
    this.fromAmountEl.value = amount;
    this.convert();
    this.addToHistory(amount);
  }

  addToHistory(amount) {
    const from = this.fromCurrencyEl.value;
    const to = this.toCurrencyEl.value;
    const result = parseFloat(this.toAmountEl.value);

    const entry = {
      from: `${amount} ${from}`,
      to: `${result.toFixed(2)} ${to}`,
      timestamp: Date.now()
    };

    this.data.history.unshift(entry);
    if (this.data.history.length > 10) {
      this.data.history = this.data.history.slice(0, 10);
    }
    this.saveData();
    this.renderHistory();
  }

  openRateModal() {
    const from = this.fromCurrencyEl.value;
    const to = this.toCurrencyEl.value;
    const rate = this.data.rates[to] / this.data.rates[from];

    this.rateInfoEl.textContent = `1 ${from} = ? ${to}`;
    this.rateInputEl.value = rate.toFixed(4);
    this.modal.classList.remove('hidden');
    this.rateInputEl.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  async saveRate() {
    const newRate = parseFloat(this.rateInputEl.value);
    if (isNaN(newRate) || newRate <= 0) return;

    const from = this.fromCurrencyEl.value;
    const to = this.toCurrencyEl.value;

    // Adjust the target currency rate relative to USD
    // New rate: 1 FROM = newRate TO
    // FROM/USD * newRate = TO/USD
    const fromToUSD = this.data.rates[from];
    this.data.rates[to] = fromToUSD * newRate;

    await this.saveData();
    this.closeModal();
    this.convert();
  }

  renderHistory() {
    this.historyListEl.innerHTML = this.data.history.map(entry => `
      <div class="history-item">
        <span class="history-from">${entry.from}</span>
        <span class="history-arrow">→</span>
        <span class="history-to">${entry.to}</span>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => new CurrencyConverter());
