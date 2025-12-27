// Status Updater - Popup Script

const STATUS_LABELS = {
  available: 'Available',
  busy: 'Busy',
  away: 'Away',
  dnd: 'Do Not Disturb',
  meeting: 'In a Meeting',
  lunch: 'On Lunch',
  brb: 'Be Right Back',
  offline: 'Offline'
};

class StatusUpdater {
  constructor() {
    this.currentStatus = 'available';
    this.currentIcon = '🟢';
    this.customMessage = '';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.statusIconEl = document.getElementById('statusIcon');
    this.statusTextEl = document.getElementById('statusText');
    this.statusMessageEl = document.getElementById('statusMessage');
    this.statusBtns = document.querySelectorAll('.status-btn');
    this.customMessageEl = document.getElementById('customMessage');
    this.setMessageBtn = document.getElementById('setMessage');
    this.copyBtn = document.getElementById('copyStatus');
  }

  bindEvents() {
    this.statusBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setStatus(btn.dataset.status, btn.dataset.icon));
    });

    this.setMessageBtn.addEventListener('click', () => this.setCustomMessage());
    this.copyBtn.addEventListener('click', () => this.copyStatus());

    this.customMessageEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.setCustomMessage();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('userStatus');
    if (result.userStatus) {
      this.currentStatus = result.userStatus.status || 'available';
      this.currentIcon = result.userStatus.icon || '🟢';
      this.customMessage = result.userStatus.message || '';
    }
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({
      userStatus: {
        status: this.currentStatus,
        icon: this.currentIcon,
        message: this.customMessage,
        updatedAt: Date.now()
      }
    });
  }

  setStatus(status, icon) {
    this.currentStatus = status;
    this.currentIcon = icon;
    this.saveData();
    this.updateUI();
  }

  setCustomMessage() {
    this.customMessage = this.customMessageEl.value.trim();
    this.saveData();
    this.updateUI();
    this.customMessageEl.value = '';
  }

  updateUI() {
    this.statusIconEl.textContent = this.currentIcon;
    this.statusTextEl.textContent = STATUS_LABELS[this.currentStatus];
    this.statusMessageEl.textContent = this.customMessage;

    this.statusBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === this.currentStatus);
    });
  }

  async copyStatus() {
    let text = `${this.currentIcon} ${STATUS_LABELS[this.currentStatus]}`;
    if (this.customMessage) {
      text += ` - ${this.customMessage}`;
    }

    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => new StatusUpdater());
