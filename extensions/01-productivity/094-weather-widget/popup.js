// Weather Widget - Popup Script

const conditionNames = {
  'sunny': 'Sunny',
  'cloudy': 'Cloudy',
  'partly-cloudy': 'Partly Cloudy',
  'rainy': 'Rainy',
  'stormy': 'Stormy',
  'snowy': 'Snowy',
  'windy': 'Windy',
  'foggy': 'Foggy'
};

class WeatherWidget {
  constructor() {
    this.data = {
      location: '',
      unit: 'C',
      history: [],
      current: null
    };
    this.selectedCondition = null;
    this.selectedIcon = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.weatherIconEl = document.getElementById('weatherIcon');
    this.temperatureEl = document.getElementById('temperature');
    this.conditionEl = document.getElementById('condition');
    this.locationEl = document.getElementById('location');
    this.weatherBtns = document.querySelectorAll('.weather-btn');
    this.tempInputEl = document.getElementById('tempInput');
    this.unitSelectEl = document.getElementById('unitSelect');
    this.saveBtn = document.getElementById('saveBtn');
    this.locationInputEl = document.getElementById('locationInput');
    this.historyListEl = document.getElementById('historyList');
  }

  bindEvents() {
    this.weatherBtns.forEach(btn => {
      btn.addEventListener('click', () => this.selectCondition(btn));
    });
    this.saveBtn.addEventListener('click', () => this.saveWeather());
    this.locationInputEl.addEventListener('change', () => this.saveLocation());
    this.unitSelectEl.addEventListener('change', () => this.updateUnit());
  }

  async loadData() {
    const result = await chrome.storage.local.get('weatherWidgetData');
    if (result.weatherWidgetData) {
      this.data = result.weatherWidgetData;
    }
    this.locationInputEl.value = this.data.location;
    this.unitSelectEl.value = this.data.unit;
    this.updateDisplay();
    this.renderHistory();
  }

  async saveData() {
    await chrome.storage.local.set({ weatherWidgetData: this.data });
  }

  selectCondition(btn) {
    this.weatherBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    this.selectedCondition = btn.dataset.condition;
    this.selectedIcon = btn.dataset.icon;
  }

  async saveLocation() {
    this.data.location = this.locationInputEl.value.trim();
    await this.saveData();
    this.updateDisplay();
  }

  async updateUnit() {
    this.data.unit = this.unitSelectEl.value;
    await this.saveData();
    this.updateDisplay();
  }

  async saveWeather() {
    const temp = parseFloat(this.tempInputEl.value);

    if (!this.selectedCondition || isNaN(temp)) {
      this.saveBtn.textContent = 'Select weather!';
      setTimeout(() => {
        this.saveBtn.textContent = 'Save';
      }, 1500);
      return;
    }

    const entry = {
      id: Date.now().toString(36),
      condition: this.selectedCondition,
      icon: this.selectedIcon,
      temperature: temp,
      unit: this.data.unit,
      createdAt: Date.now()
    };

    this.data.current = entry;
    this.data.history.unshift(entry);
    if (this.data.history.length > 30) {
      this.data.history = this.data.history.slice(0, 30);
    }

    await this.saveData();

    // Reset form
    this.weatherBtns.forEach(b => b.classList.remove('selected'));
    this.selectedCondition = null;
    this.selectedIcon = null;
    this.tempInputEl.value = '';

    this.updateDisplay();
    this.renderHistory();
  }

  updateDisplay() {
    if (this.data.current) {
      this.weatherIconEl.textContent = this.data.current.icon;
      this.temperatureEl.textContent = `${this.data.current.temperature}°${this.data.current.unit}`;
      this.conditionEl.textContent = conditionNames[this.data.current.condition] || this.data.current.condition;
    } else {
      this.weatherIconEl.textContent = '☀️';
      this.temperatureEl.textContent = '--°';
      this.conditionEl.textContent = 'No data';
    }

    this.locationEl.textContent = this.data.location || 'Set your location';
  }

  async deleteEntry(id) {
    this.data.history = this.data.history.filter(h => h.id !== id);
    if (this.data.current?.id === id) {
      this.data.current = this.data.history[0] || null;
    }
    await this.saveData();
    this.updateDisplay();
    this.renderHistory();
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  renderHistory() {
    this.historyListEl.innerHTML = this.data.history.slice(0, 7).map(entry => `
      <div class="history-item" data-id="${entry.id}">
        <span class="history-icon">${entry.icon}</span>
        <div class="history-info">
          <div class="history-temp">${entry.temperature}°${entry.unit}</div>
          <div class="history-date">${this.formatDate(entry.createdAt)}</div>
        </div>
        <button class="history-delete">×</button>
      </div>
    `).join('');

    this.historyListEl.querySelectorAll('.history-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteEntry(id);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new WeatherWidget());
