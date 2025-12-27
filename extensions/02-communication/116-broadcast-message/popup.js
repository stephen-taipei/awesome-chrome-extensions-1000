// Broadcast Message - Popup Script

const TYPE_ICONS = {
  info: 'ℹ️',
  urgent: '🚨',
  reminder: '⏰',
  update: '🔄',
  celebrate: '🎉'
};

class BroadcastMessage {
  constructor() {
    this.templates = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('messageType');
    this.subjectEl = document.getElementById('subject');
    this.messageEl = document.getElementById('message');
    this.saveBtn = document.getElementById('saveTemplate');
    this.copyBtn = document.getElementById('copyMessage');
    this.listEl = document.getElementById('templatesList');
  }

  bindEvents() {
    this.saveBtn.addEventListener('click', () => this.saveTemplate());
    this.copyBtn.addEventListener('click', () => this.copyMessage());
  }

  async loadData() {
    const result = await chrome.storage.local.get('broadcastTemplates');
    if (result.broadcastTemplates) {
      this.templates = result.broadcastTemplates;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ broadcastTemplates: this.templates });
  }

  saveTemplate() {
    const type = this.typeEl.value;
    const subject = this.subjectEl.value.trim();
    const message = this.messageEl.value.trim();

    if (!subject || !message) return;

    this.templates.unshift({
      id: Date.now(),
      type,
      subject,
      message
    });

    if (this.templates.length > 20) {
      this.templates.pop();
    }

    this.saveData();
    this.clearForm();
    this.render();
  }

  clearForm() {
    this.subjectEl.value = '';
    this.messageEl.value = '';
    this.typeEl.value = 'info';
  }

  formatMessage() {
    const type = this.typeEl.value;
    const subject = this.subjectEl.value.trim() || 'No Subject';
    const message = this.messageEl.value.trim() || 'No message content';
    const icon = TYPE_ICONS[type];

    return `${icon} ${subject.toUpperCase()}\n${'─'.repeat(30)}\n\n${message}\n\n${'─'.repeat(30)}`;
  }

  async copyMessage() {
    const formatted = this.formatMessage();
    await navigator.clipboard.writeText(formatted);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  useTemplate(id) {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      this.typeEl.value = template.type;
      this.subjectEl.value = template.subject;
      this.messageEl.value = template.message;
    }
  }

  deleteTemplate(id) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.templates.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved templates</div>';
      return;
    }

    this.listEl.innerHTML = this.templates.map(t => `
      <div class="template-item">
        <div class="template-header">
          <span class="template-type">${TYPE_ICONS[t.type]}</span>
          <span class="template-subject">${this.escapeHtml(t.subject)}</span>
        </div>
        <div class="template-message">${this.escapeHtml(t.message)}</div>
        <div class="template-actions">
          <button class="use-btn" data-use="${t.id}">Use</button>
          <button class="delete-btn" data-delete="${t.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.useTemplate(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteTemplate(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new BroadcastMessage());
