// Water Reminder - Popup Script

class WaterReminder {
  constructor() {
    this.data = {
      enabled: true,
      goal: 2000,
      interval: 45,
      todayIntake: 0,
      todayLog: [],
      streak: 0,
      history: [],
      lastDate: null
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.waterLevel = document.getElementById('waterLevel');
    this.currentIntake = document.getElementById('currentIntake');
    this.goalIntake = document.getElementById('goalIntake');
    this.progressBar = document.getElementById('progressBar');
    this.progressPercent = document.getElementById('progressPercent');
    this.todayLog = document.getElementById('todayLog');
    this.streakEl = document.getElementById('streak');
    this.avgIntakeEl = document.getElementById('avgIntake');
    this.resetBtn = document.getElementById('resetBtn');
  }

  bindEvents() {
    this.enableToggle.addEventListener('change', () => {
      this.data.enabled = this.enableToggle.checked;
      this.saveData();
    });

    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount);
        this.addWater(amount);
      });
    });

    document.querySelectorAll('.goal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.data.goal = parseInt(btn.dataset.goal);
        this.saveData();
        this.updateDisplay();
      });
    });

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.data.interval = parseInt(btn.dataset.minutes);
        this.saveData();
      });
    });

    this.resetBtn.addEventListener('click', () => {
      if (confirm('確定要重設今日紀錄嗎？')) {
        this.data.todayIntake = 0;
        this.data.todayLog = [];
        this.saveData();
        this.updateDisplay();
      }
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('waterReminderData');
    if (result.waterReminderData) {
      this.data = { ...this.data, ...result.waterReminderData };
    }

    // Check if new day
    const today = new Date().toDateString();
    if (this.data.lastDate !== today) {
      // Save yesterday's data
      if (this.data.lastDate && this.data.todayIntake > 0) {
        this.data.history.push({
          date: this.data.lastDate,
          intake: this.data.todayIntake,
          reachedGoal: this.data.todayIntake >= this.data.goal
        });

        // Keep only last 30 days
        if (this.data.history.length > 30) {
          this.data.history.shift();
        }

        // Update streak
        if (this.data.todayIntake >= this.data.goal) {
          this.data.streak++;
        } else {
          this.data.streak = 0;
        }
      }

      this.data.todayIntake = 0;
      this.data.todayLog = [];
      this.data.lastDate = today;
    }

    this.updateUI();
    this.saveData();
  }

  async saveData() {
    await chrome.storage.local.set({
      waterReminderData: this.data
    });
    chrome.runtime.sendMessage({
      action: 'updateData',
      data: this.data
    });
  }

  async addWater(amount) {
    this.data.todayIntake += amount;
    this.data.todayLog.push({
      amount,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    });

    await this.saveData();
    this.updateDisplay();

    // Check if reached goal
    if (this.data.todayIntake >= this.data.goal) {
      chrome.runtime.sendMessage({ action: 'goalReached' });
    }
  }

  updateUI() {
    this.enableToggle.checked = this.data.enabled;

    document.querySelectorAll('.goal-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.goal) === this.data.goal);
    });

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.minutes) === this.data.interval);
    });

    this.updateDisplay();
  }

  updateDisplay() {
    const percent = Math.min(100, (this.data.todayIntake / this.data.goal) * 100);

    this.waterLevel.style.height = `${percent}%`;
    this.currentIntake.textContent = this.data.todayIntake;
    this.goalIntake.textContent = this.data.goal;
    this.progressBar.style.width = `${percent}%`;
    this.progressPercent.textContent = `${Math.round(percent)}%`;

    this.streakEl.textContent = this.data.streak;

    // Calculate average
    if (this.data.history.length > 0) {
      const total = this.data.history.reduce((sum, d) => sum + d.intake, 0);
      const avg = Math.round(total / this.data.history.length);
      this.avgIntakeEl.textContent = avg >= 1000 ? `${(avg / 1000).toFixed(1)}L` : `${avg}`;
    } else {
      this.avgIntakeEl.textContent = '0';
    }

    this.renderTodayLog();
  }

  renderTodayLog() {
    this.todayLog.innerHTML = '';

    this.data.todayLog.forEach(log => {
      const item = document.createElement('div');
      item.className = 'log-item';
      item.textContent = `${log.time} +${log.amount}ml`;
      this.todayLog.appendChild(item);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new WaterReminder();
});
