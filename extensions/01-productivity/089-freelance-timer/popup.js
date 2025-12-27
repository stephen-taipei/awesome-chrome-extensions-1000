// Freelance Timer - Popup Script

class FreelanceTimer {
  constructor() {
    this.data = {
      clients: [],
      sessions: [],
      activeSession: null
    };
    this.timerInterval = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.timerDisplayEl = document.getElementById('timerDisplay');
    this.currentProjectEl = document.getElementById('currentProject');
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.clientSelectEl = document.getElementById('clientSelect');
    this.addClientBtn = document.getElementById('addClientBtn');
    this.todayEarningsEl = document.getElementById('todayEarnings');
    this.weekEarningsEl = document.getElementById('weekEarnings');
    this.monthEarningsEl = document.getElementById('monthEarnings');
    this.sessionsListEl = document.getElementById('sessionsList');
    this.modal = document.getElementById('modal');
    this.clientNameEl = document.getElementById('clientName');
    this.hourlyRateEl = document.getElementById('hourlyRate');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.stopBtn.addEventListener('click', () => this.stopTimer());
    this.addClientBtn.addEventListener('click', () => this.openModal());
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.saveBtn.addEventListener('click', () => this.saveClient());
  }

  async loadData() {
    const result = await chrome.storage.local.get('freelanceTimerData');
    if (result.freelanceTimerData) {
      this.data = result.freelanceTimerData;
    }
    this.updateClientsDropdown();
    this.updateEarnings();
    this.renderSessions();

    if (this.data.activeSession) {
      this.resumeTimer();
    }
  }

  async saveData() {
    await chrome.storage.local.set({ freelanceTimerData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  openModal() {
    this.modal.classList.remove('hidden');
    this.clientNameEl.value = '';
    this.hourlyRateEl.value = '';
    this.clientNameEl.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  async saveClient() {
    const name = this.clientNameEl.value.trim();
    const rate = parseFloat(this.hourlyRateEl.value);

    if (!name || isNaN(rate) || rate < 0) {
      return;
    }

    const client = {
      id: this.generateId(),
      name,
      hourlyRate: rate
    };

    this.data.clients.push(client);
    await this.saveData();
    this.closeModal();
    this.updateClientsDropdown();
  }

  updateClientsDropdown() {
    this.clientSelectEl.innerHTML = '<option value="">Select Client...</option>' +
      this.data.clients.map(c =>
        `<option value="${c.id}">${c.name} ($${c.hourlyRate}/hr)</option>`
      ).join('');
  }

  startTimer() {
    const clientId = this.clientSelectEl.value;
    if (!clientId) {
      this.startBtn.textContent = 'Select client!';
      setTimeout(() => {
        this.startBtn.textContent = '▶ Start';
      }, 1500);
      return;
    }

    const client = this.data.clients.find(c => c.id === clientId);
    this.data.activeSession = {
      id: this.generateId(),
      clientId,
      clientName: client.name,
      hourlyRate: client.hourlyRate,
      startTime: Date.now()
    };

    this.saveData();
    this.resumeTimer();
  }

  resumeTimer() {
    const session = this.data.activeSession;
    if (!session) return;

    this.currentProjectEl.textContent = session.clientName;
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.clientSelectEl.disabled = true;

    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - session.startTime;
      this.timerDisplayEl.textContent = this.formatDuration(elapsed);
    }, 1000);

    // Immediate update
    const elapsed = Date.now() - session.startTime;
    this.timerDisplayEl.textContent = this.formatDuration(elapsed);
  }

  async stopTimer() {
    if (!this.data.activeSession) return;

    clearInterval(this.timerInterval);

    const session = this.data.activeSession;
    const duration = Date.now() - session.startTime;
    const hours = duration / (1000 * 60 * 60);
    const earning = hours * session.hourlyRate;

    const completedSession = {
      id: session.id,
      clientId: session.clientId,
      clientName: session.clientName,
      duration,
      earning,
      createdAt: Date.now()
    };

    this.data.sessions.unshift(completedSession);
    this.data.activeSession = null;
    await this.saveData();

    this.timerDisplayEl.textContent = '00:00:00';
    this.currentProjectEl.textContent = 'Select a client';
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.clientSelectEl.disabled = false;

    this.updateEarnings();
    this.renderSessions();
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  getTodayStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).getTime();
  }

  getMonthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }

  updateEarnings() {
    const todayStart = this.getTodayStart();
    const weekStart = this.getWeekStart();
    const monthStart = this.getMonthStart();

    const todayEarnings = this.data.sessions
      .filter(s => s.createdAt >= todayStart)
      .reduce((sum, s) => sum + s.earning, 0);

    const weekEarnings = this.data.sessions
      .filter(s => s.createdAt >= weekStart)
      .reduce((sum, s) => sum + s.earning, 0);

    const monthEarnings = this.data.sessions
      .filter(s => s.createdAt >= monthStart)
      .reduce((sum, s) => sum + s.earning, 0);

    this.todayEarningsEl.textContent = this.formatCurrency(todayEarnings);
    this.weekEarningsEl.textContent = this.formatCurrency(weekEarnings);
    this.monthEarningsEl.textContent = this.formatCurrency(monthEarnings);
  }

  async deleteSession(id) {
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    await this.saveData();
    this.updateEarnings();
    this.renderSessions();
  }

  renderSessions() {
    const recent = this.data.sessions.slice(0, 10);

    this.sessionsListEl.innerHTML = recent.map(session => `
      <div class="session-item" data-id="${session.id}">
        <div class="session-info">
          <div class="session-client">${session.clientName}</div>
          <div class="session-time">${this.formatDuration(session.duration)}</div>
        </div>
        <span class="session-earning">${this.formatCurrency(session.earning)}</span>
        <button class="session-delete">×</button>
      </div>
    `).join('');

    this.sessionsListEl.querySelectorAll('.session-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteSession(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new FreelanceTimer();
});
