// Onboarding Message - Popup Script

class OnboardingMessage {
  constructor() {
    this.messages = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('messageType');
    this.newHireEl = document.getElementById('newHire');
    this.roleEl = document.getElementById('role');
    this.welcomeEl = document.getElementById('welcome');
    this.infoEl = document.getElementById('info');
    this.contactEl = document.getElementById('contact');
    this.copyBtn = document.getElementById('copyMessage');
    this.saveBtn = document.getElementById('saveMessage');
    this.listEl = document.getElementById('messageList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyMessage());
    this.saveBtn.addEventListener('click', () => this.saveMessage());
  }

  async loadData() {
    const result = await chrome.storage.local.get('onboardingMessages');
    if (result.onboardingMessages) {
      this.messages = result.onboardingMessages;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ onboardingMessages: this.messages });
  }

  getTypeLabel(type) {
    const labels = {
      welcome: 'Welcome',
      intro: 'Introduction',
      firstday: 'First Day',
      resources: 'Resources',
      checklist: 'Checklist',
      buddy: 'Buddy'
    };
    return labels[type] || type;
  }

  formatMessage() {
    const newHire = this.newHireEl.value.trim();
    const role = this.roleEl.value.trim();
    const welcome = this.welcomeEl.value.trim();
    const info = this.infoEl.value.trim();
    const contact = this.contactEl.value.trim();

    let message = `👋 Welcome to the Team${newHire ? `, ${newHire}` : ''}!\n\n`;

    if (role) {
      message += `We are thrilled to have you join us as ${role}.\n\n`;
    }

    if (welcome) {
      message += `${welcome}\n\n`;
    }

    if (info) {
      message += `📋 Important Information:\n${info}\n\n`;
    }

    if (contact) {
      message += `📧 If you have any questions, please reach out to ${contact}.\n\n`;
    }

    message += 'We are here to support you and make your transition as smooth as possible. Welcome aboard!\n\n';
    message += 'Best regards,\nThe Team';

    return message;
  }

  async copyMessage() {
    const text = this.formatMessage();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveMessage() {
    const newHire = this.newHireEl.value.trim();
    if (!newHire) return;

    const message = {
      id: Date.now(),
      type: this.typeEl.value,
      newHire,
      role: this.roleEl.value.trim(),
      welcome: this.welcomeEl.value.trim(),
      info: this.infoEl.value.trim(),
      contact: this.contactEl.value.trim(),
      created: Date.now()
    };

    this.messages.unshift(message);
    if (this.messages.length > 15) {
      this.messages.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadMessage(id) {
    const message = this.messages.find(m => m.id === id);
    if (message) {
      this.typeEl.value = message.type || 'welcome';
      this.newHireEl.value = message.newHire || '';
      this.roleEl.value = message.role || '';
      this.welcomeEl.value = message.welcome || '';
      this.infoEl.value = message.info || '';
      this.contactEl.value = message.contact || '';
    }
  }

  deleteMessage(id) {
    this.messages = this.messages.filter(m => m.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncate(text, len = 25) {
    if (!text || text.length <= len) return text || '';
    return text.substring(0, len) + '...';
  }

  render() {
    if (this.messages.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved messages</div>';
      return;
    }

    this.listEl.innerHTML = this.messages.map(m => `
      <div class="message-item">
        <div class="message-info">
          <div class="message-hire">${this.escapeHtml(this.truncate(m.newHire))}</div>
          <div class="message-type">${this.getTypeLabel(m.type)}</div>
        </div>
        <div class="message-actions">
          <button class="load-btn" data-load="${m.id}">Load</button>
          <button class="delete-btn" data-delete="${m.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadMessage(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMessage(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new OnboardingMessage());
