// Response Timer - Popup Script

class ResponseTimer {
  constructor() {
    this.timers = [];
    this.completed = [];
    this.intervalId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.labelEl = document.getElementById('label');
    this.priorityEl = document.getElementById('priority');
    this.startBtn = document.getElementById('startTimer');
    this.activeListEl = document.getElementById('activeList');
    this.completedListEl = document.getElementById('completedList');
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startTimer());
  }

  async loadData() {
    const result = await chrome.storage.local.get(['responseTimers', 'completedTimers']);
    if (result.responseTimers) {
      this.timers = result.responseTimers;
    }
    if (result.completedTimers) {
      this.completed = result.completedTimers;
    }
    this.render();
    this.startUpdating();
  }

  async saveData() {
    await chrome.storage.local.set({
      responseTimers: this.timers,
      completedTimers: this.completed
    });
  }

  startTimer() {
    const label = this.labelEl.value.trim();
    const priority = this.priorityEl.value;

    if (!label) return;

    this.timers.push({
      id: Date.now(),
      label,
      priority,
      startTime: Date.now()
    });

    this.labelEl.value = '';
    this.priorityEl.value = 'normal';
    this.saveData();
    this.render();
  }

  completeTimer(id) {
    const timer = this.timers.find(t => t.id === id);
    if (timer) {
      const elapsed = Date.now() - timer.startTime;
      this.completed.unshift({
        ...timer,
        elapsed,
        completedAt: new Date().toLocaleDateString()
      });

      if (this.completed.length > 20) {
        this.completed.pop();
      }

      this.timers = this.timers.filter(t => t.id !== id);
      this.saveData();
      this.render();
    }
  }

  cancelTimer(id) {
    this.timers = this.timers.filter(t => t.id !== id);
    this.saveData();
    this.render();
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  startUpdating() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.timers.length > 0) {
        this.updateTimerDisplays();
      }
    }, 1000);
  }

  updateTimerDisplays() {
    this.timers.forEach(timer => {
      const el = this.activeListEl.querySelector(`[data-timer="${timer.id}"]`);
      if (el) {
        const elapsed = Date.now() - timer.startTime;
        el.textContent = this.formatTime(elapsed);
      }
    });
  }

  render() {
    this.renderActive();
    this.renderCompleted();
  }

  renderActive() {
    if (this.timers.length === 0) {
      this.activeListEl.innerHTML = '<div class="empty-state">No active timers</div>';
      return;
    }

    this.activeListEl.innerHTML = this.timers.map(t => {
      const elapsed = Date.now() - t.startTime;
      return `
        <div class="timer-item">
          <div class="timer-header">
            <span class="timer-label">${this.escapeHtml(t.label)}</span>
            <span class="timer-priority ${t.priority}">${t.priority}</span>
          </div>
          <div class="timer-time" data-timer="${t.id}">${this.formatTime(elapsed)}</div>
          <div class="timer-actions">
            <button class="complete-btn" data-complete="${t.id}">Complete</button>
            <button class="cancel-btn" data-cancel="${t.id}">Cancel</button>
          </div>
        </div>
      `;
    }).join('');

    this.activeListEl.querySelectorAll('[data-complete]').forEach(btn => {
      btn.addEventListener('click', () => this.completeTimer(parseInt(btn.dataset.complete)));
    });

    this.activeListEl.querySelectorAll('[data-cancel]').forEach(btn => {
      btn.addEventListener('click', () => this.cancelTimer(parseInt(btn.dataset.cancel)));
    });
  }

  renderCompleted() {
    if (this.completed.length === 0) {
      this.completedListEl.innerHTML = '<div class="empty-state">No completed timers</div>';
      return;
    }

    this.completedListEl.innerHTML = this.completed.slice(0, 5).map(t => `
      <div class="timer-item completed-item">
        <div class="timer-header">
          <span class="timer-label">${this.escapeHtml(t.label)}</span>
          <span class="timer-priority ${t.priority}">${t.priority}</span>
        </div>
        <div class="timer-time">${this.formatTime(t.elapsed)}</div>
      </div>
    `).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ResponseTimer());
