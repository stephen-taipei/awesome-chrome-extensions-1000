// Team Update - Popup Script

class TeamUpdate {
  constructor() {
    this.updates = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('statusType');
    this.textEl = document.getElementById('updateText');
    this.postBtn = document.getElementById('postUpdate');
    this.copyBtn = document.getElementById('copyUpdate');
    this.listEl = document.getElementById('updateList');
  }

  bindEvents() {
    this.postBtn.addEventListener('click', () => this.postUpdate());
    this.copyBtn.addEventListener('click', () => this.copyUpdate());
  }

  async loadData() {
    const result = await chrome.storage.local.get('teamUpdates');
    if (result.teamUpdates) {
      this.updates = result.teamUpdates;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ teamUpdates: this.updates });
  }

  getTypeLabel(type) {
    const labels = {
      progress: '📈 Progress',
      completed: '✅ Completed',
      blocked: '🚧 Blocked',
      help: '🙋 Need Help',
      announcement: '📢 Announcement'
    };
    return labels[type] || type;
  }

  formatUpdate() {
    const type = this.typeEl.value;
    const text = this.textEl.value.trim();
    const time = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    return `${this.getTypeLabel(type)}\n${text}\n— ${time}`;
  }

  async postUpdate() {
    const text = this.textEl.value.trim();
    if (!text) return;

    const update = {
      id: Date.now(),
      type: this.typeEl.value,
      text: text,
      time: Date.now()
    };

    this.updates.unshift(update);
    if (this.updates.length > 20) {
      this.updates.pop();
    }

    this.saveData();
    this.textEl.value = '';
    this.render();

    const original = this.postBtn.textContent;
    this.postBtn.textContent = 'Posted!';
    setTimeout(() => {
      this.postBtn.textContent = original;
    }, 1500);
  }

  async copyUpdate() {
    const text = this.formatUpdate();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  deleteUpdate(id) {
    this.updates = this.updates.filter(u => u.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  render() {
    if (this.updates.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No updates yet</div>';
      return;
    }

    this.listEl.innerHTML = this.updates.map(u => `
      <div class="update-item">
        <div class="update-header">
          <span class="update-type type-${u.type}">${this.getTypeLabel(u.type)}</span>
          <span class="update-time">${this.formatTime(u.time)}</span>
        </div>
        <div class="update-text">${this.escapeHtml(u.text)}</div>
        <div class="update-footer">
          <button class="delete-btn" data-delete="${u.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteUpdate(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new TeamUpdate());
