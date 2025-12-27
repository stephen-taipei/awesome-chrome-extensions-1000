// Status Message - Popup Script

class StatusMessage {
  constructor() {
    this.currentStatus = 'available';
    this.presets = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.statusBtns = document.querySelectorAll('.status-btn');
    this.messageEl = document.getElementById('statusMessage');
    this.copyBtn = document.getElementById('copyStatus');
    this.saveBtn = document.getElementById('savePreset');
    this.listEl = document.getElementById('presetList');
  }

  bindEvents() {
    this.statusBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setStatus(btn.dataset.status));
    });
    this.copyBtn.addEventListener('click', () => this.copyStatus());
    this.saveBtn.addEventListener('click', () => this.savePreset());
  }

  async loadData() {
    const result = await chrome.storage.local.get(['statusPresets', 'currentStatus', 'statusMessage']);
    if (result.statusPresets) {
      this.presets = result.statusPresets;
    }
    if (result.currentStatus) {
      this.currentStatus = result.currentStatus;
      this.updateStatusButtons();
    }
    if (result.statusMessage) {
      this.messageEl.value = result.statusMessage;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({
      statusPresets: this.presets,
      currentStatus: this.currentStatus,
      statusMessage: this.messageEl.value
    });
  }

  getStatusIcon(status) {
    const icons = {
      available: '🟢',
      busy: '🔴',
      away: '🟡',
      dnd: '⛔'
    };
    return icons[status] || '🟢';
  }

  getStatusLabel(status) {
    const labels = {
      available: 'Available',
      busy: 'Busy',
      away: 'Away',
      dnd: 'Do Not Disturb'
    };
    return labels[status] || status;
  }

  setStatus(status) {
    this.currentStatus = status;
    this.updateStatusButtons();
    this.saveData();
  }

  updateStatusButtons() {
    this.statusBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === this.currentStatus);
    });
  }

  formatStatus() {
    const icon = this.getStatusIcon(this.currentStatus);
    const label = this.getStatusLabel(this.currentStatus);
    const message = this.messageEl.value.trim();

    if (message) {
      return `${icon} ${label}: ${message}`;
    }
    return `${icon} ${label}`;
  }

  async copyStatus() {
    const text = this.formatStatus();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  savePreset() {
    const message = this.messageEl.value.trim();
    if (!message) return;

    const preset = {
      id: Date.now(),
      status: this.currentStatus,
      message: message
    };

    this.presets.unshift(preset);
    if (this.presets.length > 10) {
      this.presets.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  usePreset(id) {
    const preset = this.presets.find(p => p.id === id);
    if (preset) {
      this.currentStatus = preset.status;
      this.messageEl.value = preset.message;
      this.updateStatusButtons();
      this.saveData();
    }
  }

  deletePreset(id) {
    this.presets = this.presets.filter(p => p.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.presets.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved presets</div>';
      return;
    }

    this.listEl.innerHTML = this.presets.map(p => `
      <div class="preset-item">
        <div class="preset-info">
          <span class="preset-status">${this.getStatusIcon(p.status)}</span>
          <span class="preset-message">${this.escapeHtml(p.message)}</span>
        </div>
        <div class="preset-actions">
          <button class="use-btn" data-use="${p.id}">Use</button>
          <button class="delete-btn" data-delete="${p.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.usePreset(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePreset(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new StatusMessage());
