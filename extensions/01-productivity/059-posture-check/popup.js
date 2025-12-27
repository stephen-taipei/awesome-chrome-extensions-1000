// Posture Check - Popup Script

class PostureCheck {
  constructor() {
    this.data = {
      enabled: true,
      interval: 20,
      goodCount: 0,
      badCount: 0,
      nextCheckTime: null,
      lastDate: null
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.startTimer();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.statusEmoji = document.getElementById('statusEmoji');
    this.statusText = document.getElementById('statusText');
    this.nextCheck = document.getElementById('nextCheck');
    this.goodPostureBtn = document.getElementById('goodPostureBtn');
    this.badPostureBtn = document.getElementById('badPostureBtn');
    this.goodCountEl = document.getElementById('goodCount');
    this.badCountEl = document.getElementById('badCount');
    this.postureScoreEl = document.getElementById('postureScore');
  }

  bindEvents() {
    this.enableToggle.addEventListener('change', () => {
      this.data.enabled = this.enableToggle.checked;
      if (this.data.enabled) {
        this.scheduleNextCheck();
      }
      this.saveData();
      this.updateDisplay();
    });

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.data.interval = parseInt(btn.dataset.minutes);
        this.scheduleNextCheck();
        this.saveData();
      });
    });

    this.goodPostureBtn.addEventListener('click', () => this.recordPosture(true));
    this.badPostureBtn.addEventListener('click', () => this.recordPosture(false));
  }

  async loadData() {
    const result = await chrome.storage.local.get('postureCheckData');
    if (result.postureCheckData) {
      this.data = { ...this.data, ...result.postureCheckData };
    }

    // Check if new day
    const today = new Date().toDateString();
    if (this.data.lastDate !== today) {
      this.data.goodCount = 0;
      this.data.badCount = 0;
      this.data.lastDate = today;
    }

    this.updateUI();
    this.saveData();
  }

  async saveData() {
    await chrome.storage.local.set({
      postureCheckData: this.data
    });
    chrome.runtime.sendMessage({
      action: 'updateData',
      data: this.data
    });
  }

  scheduleNextCheck() {
    this.data.nextCheckTime = Date.now() + (this.data.interval * 60 * 1000);
  }

  async recordPosture(isGood) {
    if (isGood) {
      this.data.goodCount++;
      this.statusEmoji.textContent = '😊';
      this.statusText.textContent = '太棒了！繼續保持！';
    } else {
      this.data.badCount++;
      this.statusEmoji.textContent = '💪';
      this.statusText.textContent = '調整一下姿勢吧！';
    }

    this.scheduleNextCheck();
    await this.saveData();
    this.updateStats();
  }

  updateUI() {
    this.enableToggle.checked = this.data.enabled;

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.minutes) === this.data.interval);
    });

    this.updateStats();
    this.updateDisplay();
  }

  updateStats() {
    this.goodCountEl.textContent = this.data.goodCount;
    this.badCountEl.textContent = this.data.badCount;

    const total = this.data.goodCount + this.data.badCount;
    const score = total > 0 ? Math.round((this.data.goodCount / total) * 100) : 100;
    this.postureScoreEl.textContent = `${score}%`;
  }

  updateDisplay() {
    if (!this.data.enabled) {
      this.statusEmoji.textContent = '😴';
      this.statusText.textContent = '姿勢提醒已暫停';
      this.nextCheck.textContent = '';
      return;
    }
  }

  startTimer() {
    if (!this.data.nextCheckTime) {
      this.scheduleNextCheck();
    }

    setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    if (!this.data.enabled) return;

    const now = Date.now();
    const remaining = Math.max(0, this.data.nextCheckTime - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    if (remaining > 0) {
      this.nextCheck.textContent = `下次提醒：${minutes} 分 ${seconds} 秒後`;
    } else {
      this.nextCheck.textContent = '該檢查姿勢了！';
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new PostureCheck();
});
