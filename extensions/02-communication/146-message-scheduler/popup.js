// Message Scheduler - Popup Script

class MessageScheduler {
  constructor() {
    this.messages = [];
    this.platforms = {
      email: '📧',
      slack: '💬',
      sms: '📱',
      other: '📝'
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaults();
  }

  initElements() {
    this.recipientEl = document.getElementById('recipient');
    this.messageEl = document.getElementById('message');
    this.dateEl = document.getElementById('scheduleDate');
    this.timeEl = document.getElementById('scheduleTime');
    this.platformEl = document.getElementById('platform');
    this.scheduleBtn = document.getElementById('scheduleBtn');
    this.listEl = document.getElementById('messageList');
  }

  bindEvents() {
    this.scheduleBtn.addEventListener('click', () => this.scheduleMessage());
  }

  setDefaults() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateEl.value = tomorrow.toISOString().split('T')[0];
    this.timeEl.value = '09:00';
  }

  async loadData() {
    const result = await chrome.storage.local.get('scheduledMessages');
    if (result.scheduledMessages) {
      this.messages = result.scheduledMessages;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ scheduledMessages: this.messages });
  }

  scheduleMessage() {
    const recipient = this.recipientEl.value.trim();
    const message = this.messageEl.value.trim();
    const date = this.dateEl.value;
    const time = this.timeEl.value;
    const platform = this.platformEl.value;

    if (!recipient || !message) return;

    const scheduled = {
      id: Date.now(),
      recipient,
      message,
      date,
      time,
      platform,
      created: Date.now()
    };

    this.messages.unshift(scheduled);
    if (this.messages.length > 20) {
      this.messages.pop();
    }

    this.saveData();
    this.render();

    // Clear form
    this.recipientEl.value = '';
    this.messageEl.value = '';
    this.setDefaults();

    const original = this.scheduleBtn.textContent;
    this.scheduleBtn.textContent = 'Scheduled!';
    setTimeout(() => {
      this.scheduleBtn.textContent = original;
    }, 1500);
  }

  async copyMessage(id) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
      const text = `To: ${msg.recipient}\n\n${msg.message}`;
      await navigator.clipboard.writeText(text);
    }
  }

  deleteMessage(id) {
    this.messages = this.messages.filter(m => m.id !== id);
    this.saveData();
    this.render();
  }

  formatDateTime(date, time) {
    if (!date) return 'Not set';
    const d = new Date(`${date}T${time || '00:00'}`);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.messages.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No scheduled messages</div>';
      return;
    }

    this.listEl.innerHTML = this.messages.map(m => `
      <div class="message-item">
        <div class="message-header">
          <span class="message-recipient">${this.escapeHtml(m.recipient)}</span>
          <span class="message-platform">${this.platforms[m.platform]}</span>
        </div>
        <div class="message-preview">${this.escapeHtml(m.message)}</div>
        <div class="message-footer">
          <span class="message-time">${this.formatDateTime(m.date, m.time)}</span>
          <div class="message-actions">
            <button class="copy-btn" data-copy="${m.id}">Copy</button>
            <button class="delete-btn" data-delete="${m.id}">Del</button>
          </div>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyMessage(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMessage(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new MessageScheduler());
