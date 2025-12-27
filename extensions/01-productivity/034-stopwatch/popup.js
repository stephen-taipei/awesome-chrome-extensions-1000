// Stopwatch - Popup Script

class Stopwatch {
  constructor() {
    this.state = {
      isRunning: false,
      startTime: 0,
      elapsedTime: 0,
      laps: []
    };
    this.history = [];
    this.animationId = null;

    this.initElements();
    this.loadData();
    this.bindEvents();
  }

  initElements() {
    this.timerTime = document.getElementById('timerTime');
    this.timerMs = document.getElementById('timerMs');
    this.startBtn = document.getElementById('startBtn');
    this.lapBtn = document.getElementById('lapBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.lapsList = document.getElementById('lapsList');
    this.lapCount = document.getElementById('lapCount');
    this.historyList = document.getElementById('historyList');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.exportBtn = document.getElementById('exportBtn');
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['stopwatchState', 'stopwatchHistory']);

      if (result.stopwatchState) {
        this.state = result.stopwatchState;

        // If was running, calculate elapsed time
        if (this.state.isRunning && this.state.startTime) {
          const now = Date.now();
          this.state.elapsedTime += now - this.state.startTime;
          this.state.startTime = now;
        }
      }

      this.history = result.stopwatchHistory || [];

      this.render();

      if (this.state.isRunning) {
        this.startAnimation();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      await chrome.storage.local.set({
        stopwatchState: this.state,
        stopwatchHistory: this.history
      });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  formatTime(ms, includeMs = false) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (includeMs) {
      return timeStr + `.${milliseconds.toString().padStart(3, '0')}`;
    }
    return timeStr;
  }

  formatMs(ms) {
    return `.${(ms % 1000).toString().padStart(3, '0')}`;
  }

  getCurrentTime() {
    if (this.state.isRunning) {
      return this.state.elapsedTime + (Date.now() - this.state.startTime);
    }
    return this.state.elapsedTime;
  }

  render() {
    const currentTime = this.getCurrentTime();
    this.timerTime.textContent = this.formatTime(currentTime);
    this.timerMs.textContent = this.formatMs(currentTime);

    // Update buttons
    if (this.state.isRunning) {
      this.startBtn.textContent = '⏸ 暫停';
      this.startBtn.classList.add('running');
      this.lapBtn.disabled = false;
    } else {
      this.startBtn.textContent = '▶ 開始';
      this.startBtn.classList.remove('running');
      this.lapBtn.disabled = this.state.elapsedTime === 0;
    }

    this.renderLaps();
    this.renderHistory();
  }

  renderLaps() {
    this.lapCount.textContent = this.state.laps.length;

    if (this.state.laps.length === 0) {
      this.lapsList.innerHTML = '<div class="empty-state">尚無分圈記錄</div>';
      return;
    }

    // Find best and worst laps
    const splits = this.state.laps.map((lap, i) => ({
      index: i,
      split: i === 0 ? lap.time : lap.time - this.state.laps[i - 1].time
    }));

    const bestLap = splits.reduce((a, b) => a.split < b.split ? a : b);
    const worstLap = splits.reduce((a, b) => a.split > b.split ? a : b);

    this.lapsList.innerHTML = [...this.state.laps].reverse().map((lap, displayIndex) => {
      const actualIndex = this.state.laps.length - 1 - displayIndex;
      const prevTime = actualIndex > 0 ? this.state.laps[actualIndex - 1].time : 0;
      const splitTime = lap.time - prevTime;

      let className = 'lap-item';
      if (this.state.laps.length > 2) {
        if (actualIndex === bestLap.index) className += ' best';
        else if (actualIndex === worstLap.index) className += ' worst';
      }

      return `
        <div class="${className}">
          <span class="lap-number">#${actualIndex + 1}</span>
          <span class="lap-split">+${this.formatTime(splitTime, true)}</span>
          <span class="lap-total">${this.formatTime(lap.time, true)}</span>
        </div>
      `;
    }).join('');
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historyList.innerHTML = '<div class="empty-state">尚無歷史記錄</div>';
      return;
    }

    this.historyList.innerHTML = this.history.slice(0, 10).map(item => {
      const date = new Date(item.date);
      return `
        <div class="history-item">
          <span class="history-date">${date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}</span>
          <span class="history-time">${this.formatTime(item.totalTime, true)}</span>
          <span class="history-laps">${item.laps} 圈</span>
        </div>
      `;
    }).join('');
  }

  start() {
    if (this.state.isRunning) {
      // Pause
      this.state.elapsedTime += Date.now() - this.state.startTime;
      this.state.isRunning = false;
      this.stopAnimation();
    } else {
      // Start
      this.state.startTime = Date.now();
      this.state.isRunning = true;
      this.startAnimation();
    }

    this.saveData();
    this.render();
  }

  lap() {
    if (!this.state.isRunning) return;

    const currentTime = this.getCurrentTime();
    this.state.laps.push({
      time: currentTime,
      timestamp: Date.now()
    });

    this.saveData();
    this.render();
  }

  reset() {
    // Save to history if there was a session
    if (this.state.elapsedTime > 0 || this.state.laps.length > 0) {
      this.history.unshift({
        date: Date.now(),
        totalTime: this.getCurrentTime(),
        laps: this.state.laps.length
      });

      // Keep only last 50 records
      this.history = this.history.slice(0, 50);
    }

    this.state = {
      isRunning: false,
      startTime: 0,
      elapsedTime: 0,
      laps: []
    };

    this.stopAnimation();
    this.saveData();
    this.render();
  }

  startAnimation() {
    const update = () => {
      if (!this.state.isRunning) return;

      const currentTime = this.getCurrentTime();
      this.timerTime.textContent = this.formatTime(currentTime);
      this.timerMs.textContent = this.formatMs(currentTime);

      this.animationId = requestAnimationFrame(update);
    };

    this.animationId = requestAnimationFrame(update);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  clearHistory() {
    if (this.history.length === 0) return;
    if (!confirm('確定要清除所有歷史記錄嗎？')) return;

    this.history = [];
    this.saveData();
    this.render();
  }

  exportData() {
    let csv = 'Type,Date,Total Time,Lap Number,Split Time\n';

    // Current session laps
    if (this.state.laps.length > 0) {
      this.state.laps.forEach((lap, i) => {
        const splitTime = i === 0 ? lap.time : lap.time - this.state.laps[i - 1].time;
        csv += `Current,${new Date().toISOString()},${this.formatTime(lap.time, true)},${i + 1},${this.formatTime(splitTime, true)}\n`;
      });
    }

    // History
    this.history.forEach(item => {
      csv += `History,${new Date(item.date).toISOString()},${this.formatTime(item.totalTime, true)},${item.laps},-\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stopwatch-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.start());
    this.lapBtn.addEventListener('click', () => this.lap());
    this.resetBtn.addEventListener('click', () => this.reset());
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    this.exportBtn.addEventListener('click', () => this.exportData());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        this.start();
      } else if (e.key === 'l' || e.key === 'L') {
        this.lap();
      } else if (e.key === 'r' || e.key === 'R') {
        this.reset();
      }
    });

    // Cleanup
    window.addEventListener('unload', () => {
      this.stopAnimation();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Stopwatch();
});
