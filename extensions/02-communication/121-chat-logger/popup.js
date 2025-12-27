// Chat Logger - Popup Script

class ChatLogger {
  constructor() {
    this.logs = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.contactEl = document.getElementById('contact');
    this.platformEl = document.getElementById('platform');
    this.contentEl = document.getElementById('content');
    this.addBtn = document.getElementById('addLog');
    this.exportBtn = document.getElementById('exportLogs');
    this.listEl = document.getElementById('logsList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addLog());
    this.exportBtn.addEventListener('click', () => this.exportLogs());
  }

  async loadData() {
    const result = await chrome.storage.local.get('chatLogs');
    if (result.chatLogs) {
      this.logs = result.chatLogs;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ chatLogs: this.logs });
  }

  addLog() {
    const contact = this.contactEl.value.trim();
    const platform = this.platformEl.value.trim();
    const content = this.contentEl.value.trim();

    if (!contact || !content) return;

    const now = new Date();
    this.logs.unshift({
      id: Date.now(),
      contact,
      platform: platform || 'General',
      content,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (this.logs.length > 100) {
      this.logs.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.contactEl.value = '';
    this.platformEl.value = '';
    this.contentEl.value = '';
  }

  deleteLog(id) {
    this.logs = this.logs.filter(l => l.id !== id);
    this.saveData();
    this.render();
  }

  async exportLogs() {
    if (this.logs.length === 0) return;

    const text = this.logs.map(l =>
      `[${l.date} ${l.time}] ${l.contact} (${l.platform})\n${l.content}\n${'─'.repeat(40)}`
    ).join('\n\n');

    await navigator.clipboard.writeText(text);

    const original = this.exportBtn.textContent;
    this.exportBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.exportBtn.textContent = original;
    }, 1500);
  }

  render() {
    if (this.logs.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No chat logs yet</div>';
      return;
    }

    this.listEl.innerHTML = this.logs.map(l => `
      <div class="log-item">
        <div class="log-header">
          <span class="log-contact">${this.escapeHtml(l.contact)}</span>
          <span class="log-platform">${this.escapeHtml(l.platform)}</span>
        </div>
        <div class="log-content">${this.escapeHtml(l.content)}</div>
        <div class="log-footer">
          <span class="log-date">${l.date} ${l.time}</span>
          <button class="delete-btn" data-id="${l.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteLog(parseInt(btn.dataset.id)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ChatLogger());
