// Meditation Timer - Popup Script

class MeditationTimer {
  constructor() {
    this.data = {
      todaySessions: 0,
      totalMinutes: 0,
      streak: 0,
      lastDate: null
    };
    this.selectedMinutes = 5;
    this.selectedPattern = '4-7-8';
    this.isRunning = false;
    this.remainingSeconds = 0;
    this.breathPhase = 'ready';
    this.timer = null;
    this.breathTimer = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.breathCircle = document.getElementById('breathCircle');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.breathText = document.getElementById('breathText');
    this.durationSection = document.getElementById('durationSection');
    this.breathingSection = document.getElementById('breathingSection');
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.todaySessionsEl = document.getElementById('todaySessions');
    this.totalMinutesEl = document.getElementById('totalMinutes');
    this.streakEl = document.getElementById('streak');
  }

  bindEvents() {
    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isRunning) return;
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMinutes = parseInt(btn.dataset.minutes);
        this.timerDisplay.textContent = this.formatTime(this.selectedMinutes * 60);
      });
    });

    document.querySelectorAll('.breathing-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isRunning) return;
        document.querySelectorAll('.breathing-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedPattern = btn.dataset.pattern;
      });
    });

    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn.addEventListener('click', () => this.stop());
  }

  async loadData() {
    const result = await chrome.storage.local.get('meditationData');
    if (result.meditationData) {
      this.data = { ...this.data, ...result.meditationData };
    }

    const today = new Date().toDateString();
    if (this.data.lastDate !== today) {
      if (this.data.lastDate && this.data.todaySessions > 0) {
        const lastDate = new Date(this.data.lastDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() === yesterday.toDateString()) {
          this.data.streak++;
        } else {
          this.data.streak = 0;
        }
      }
      this.data.todaySessions = 0;
      this.data.lastDate = today;
    }

    this.updateStats();
    await this.saveData();
  }

  async saveData() {
    await chrome.storage.local.set({ meditationData: this.data });
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  start() {
    this.isRunning = true;
    this.remainingSeconds = this.selectedMinutes * 60;

    this.startBtn.classList.add('hidden');
    this.stopBtn.classList.remove('hidden');
    this.durationSection.style.opacity = '0.5';
    this.durationSection.style.pointerEvents = 'none';
    this.breathingSection.style.opacity = '0.5';
    this.breathingSection.style.pointerEvents = 'none';

    this.startTimer();
    this.startBreathing();
  }

  stop() {
    this.isRunning = false;

    if (this.timer) clearInterval(this.timer);
    if (this.breathTimer) clearTimeout(this.breathTimer);

    this.startBtn.classList.remove('hidden');
    this.stopBtn.classList.add('hidden');
    this.durationSection.style.opacity = '1';
    this.durationSection.style.pointerEvents = 'auto';
    this.breathingSection.style.opacity = '1';
    this.breathingSection.style.pointerEvents = 'auto';

    this.breathCircle.classList.remove('inhale', 'exhale');
    this.breathText.textContent = '準備開始';
    this.timerDisplay.textContent = this.formatTime(this.selectedMinutes * 60);
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.remainingSeconds--;
      this.timerDisplay.textContent = this.formatTime(this.remainingSeconds);

      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 1000);
  }

  startBreathing() {
    const [inhale, hold, exhale] = this.selectedPattern.split('-').map(Number);

    const breathCycle = () => {
      if (!this.isRunning) return;

      // Inhale
      this.breathCircle.classList.remove('exhale');
      this.breathCircle.classList.add('inhale');
      this.breathText.textContent = '吸氣...';

      this.breathTimer = setTimeout(() => {
        if (!this.isRunning) return;

        // Hold
        this.breathText.textContent = '屏息...';

        this.breathTimer = setTimeout(() => {
          if (!this.isRunning) return;

          // Exhale
          this.breathCircle.classList.remove('inhale');
          this.breathCircle.classList.add('exhale');
          this.breathText.textContent = '呼氣...';

          this.breathTimer = setTimeout(() => {
            if (this.isRunning) breathCycle();
          }, exhale * 1000);

        }, hold * 1000);

      }, inhale * 1000);
    };

    breathCycle();
  }

  async complete() {
    this.stop();

    this.data.todaySessions++;
    this.data.totalMinutes += this.selectedMinutes;
    await this.saveData();
    this.updateStats();

    chrome.runtime.sendMessage({
      action: 'meditationComplete',
      minutes: this.selectedMinutes
    });
  }

  updateStats() {
    this.todaySessionsEl.textContent = this.data.todaySessions;
    this.totalMinutesEl.textContent = this.data.totalMinutes;
    this.streakEl.textContent = this.data.streak;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new MeditationTimer();
});
