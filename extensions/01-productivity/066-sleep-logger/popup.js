// Sleep Logger - Popup Script

const qualityEmojis = ['', '😫', '😔', '😐', '😊', '😴'];

class SleepLogger {
  constructor() {
    this.data = {
      entries: []
    };
    this.selectedQuality = 4;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.bedTimeInput = document.getElementById('bedTime');
    this.wakeTimeInput = document.getElementById('wakeTime');
    this.qualityBtns = document.querySelectorAll('.quality-btn');
    this.logBtn = document.getElementById('logBtn');
    this.avgSleepEl = document.getElementById('avgSleep');
    this.avgBedtimeEl = document.getElementById('avgBedtime');
    this.avgWaketimeEl = document.getElementById('avgWaketime');
    this.weekChart = document.getElementById('weekChart');
    this.historyList = document.getElementById('historyList');
  }

  bindEvents() {
    this.qualityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.qualityBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedQuality = parseInt(btn.dataset.quality);
      });
    });

    this.logBtn.addEventListener('click', () => this.logSleep());
  }

  async loadData() {
    const result = await chrome.storage.local.get('sleepLoggerData');
    if (result.sleepLoggerData) {
      this.data = result.sleepLoggerData;
    }
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ sleepLoggerData: this.data });
  }

  calculateDuration(bedTime, wakeTime) {
    const [bedHour, bedMin] = bedTime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    // Handle overnight sleep
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return wakeMinutes - bedMinutes;
  }

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  async logSleep() {
    const bedTime = this.bedTimeInput.value;
    const wakeTime = this.wakeTimeInput.value;
    const duration = this.calculateDuration(bedTime, wakeTime);

    const today = new Date();
    today.setDate(today.getDate() - 1); // Log for yesterday
    const dateStr = today.toDateString();

    // Check if entry already exists
    const existingIndex = this.data.entries.findIndex(e => e.date === dateStr);

    const entry = {
      date: dateStr,
      bedTime,
      wakeTime,
      duration,
      quality: this.selectedQuality,
      timestamp: Date.now()
    };

    if (existingIndex !== -1) {
      this.data.entries[existingIndex] = entry;
    } else {
      this.data.entries.push(entry);
    }

    // Keep last 30 entries
    if (this.data.entries.length > 30) {
      this.data.entries = this.data.entries.slice(-30);
    }

    await this.saveData();
    this.updateUI();

    this.logBtn.textContent = '已記錄 ✓';
    setTimeout(() => {
      this.logBtn.textContent = '記錄睡眠';
    }, 2000);
  }

  updateUI() {
    this.updateStats();
    this.updateChart();
    this.updateHistory();
  }

  updateStats() {
    if (this.data.entries.length === 0) return;

    const last7 = this.data.entries.slice(-7);

    // Average sleep duration
    const avgDuration = Math.round(
      last7.reduce((sum, e) => sum + e.duration, 0) / last7.length
    );
    this.avgSleepEl.textContent = this.formatDuration(avgDuration);

    // Average bedtime
    const avgBedMinutes = Math.round(
      last7.reduce((sum, e) => {
        const [h, m] = e.bedTime.split(':').map(Number);
        let mins = h * 60 + m;
        if (h < 12) mins += 24 * 60; // Handle after midnight
        return sum + mins;
      }, 0) / last7.length
    );
    const bedHour = Math.floor((avgBedMinutes % (24 * 60)) / 60);
    const bedMin = avgBedMinutes % 60;
    this.avgBedtimeEl.textContent = `${bedHour.toString().padStart(2, '0')}:${bedMin.toString().padStart(2, '0')}`;

    // Average wake time
    const avgWakeMinutes = Math.round(
      last7.reduce((sum, e) => {
        const [h, m] = e.wakeTime.split(':').map(Number);
        return sum + h * 60 + m;
      }, 0) / last7.length
    );
    const wakeHour = Math.floor(avgWakeMinutes / 60);
    const wakeMin = avgWakeMinutes % 60;
    this.avgWaketimeEl.textContent = `${wakeHour.toString().padStart(2, '0')}:${wakeMin.toString().padStart(2, '0')}`;
  }

  updateChart() {
    const now = new Date();
    const today = now.getDay();

    // Get start of week (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - today - 1); // -1 because we log for previous night

    const bars = this.weekChart.querySelectorAll('.chart-bar');
    bars.forEach((bar, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toDateString();

      const entry = this.data.entries.find(e => e.date === dateStr);
      const barEl = bar.querySelector('.bar');

      if (entry) {
        // Max height = 60px for 10 hours
        const height = Math.min(60, (entry.duration / 600) * 60);
        barEl.style.height = `${height}px`;
      } else {
        barEl.style.height = '0px';
      }
    });
  }

  updateHistory() {
    this.historyList.innerHTML = '';

    const recent = this.data.entries.slice(-5).reverse();

    recent.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric'
      });

      item.innerHTML = `
        <span class="history-quality">${qualityEmojis[entry.quality]}</span>
        <div class="history-info">
          <div class="history-date">${formattedDate}</div>
          <div class="history-duration">${this.formatDuration(entry.duration)}</div>
        </div>
      `;

      this.historyList.appendChild(item);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new SleepLogger();
});
