// Out of Office - Popup Script

class OutOfOffice {
  constructor() {
    this.saved = [];
    this.templates = {
      vacation: "Hi there! I'm currently out of the office on vacation with limited access to email. I'll respond to your message when I return{returnDate}. {contact}Thank you for your patience!",
      sick: "Thank you for your email. I'm currently out sick and will respond when I'm feeling better{returnDate}. {contact}For urgent matters, please contact my team.",
      meeting: "Thanks for reaching out! I'm currently in meetings and will have limited availability today. I'll get back to you as soon as possible{returnDate}. {contact}",
      holiday: "Happy holidays! I'm currently out of the office for the holiday season. I'll respond to your message when I return{returnDate}. {contact}Wishing you a wonderful holiday!"
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaultDate();
  }

  initElements() {
    this.templateBtns = document.querySelectorAll('.template-btn');
    this.returnDateEl = document.getElementById('returnDate');
    this.contactEl = document.getElementById('contact');
    this.messageEl = document.getElementById('message');
    this.copyBtn = document.getElementById('copyMessage');
    this.saveBtn = document.getElementById('saveTemplate');
    this.listEl = document.getElementById('savedList');
  }

  bindEvents() {
    this.templateBtns.forEach(btn => {
      btn.addEventListener('click', () => this.applyTemplate(btn.dataset.template));
    });
    this.copyBtn.addEventListener('click', () => this.copyMessage());
    this.saveBtn.addEventListener('click', () => this.saveMessage());
  }

  setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.returnDateEl.value = tomorrow.toISOString().split('T')[0];
  }

  async loadData() {
    const result = await chrome.storage.local.get('oooSaved');
    if (result.oooSaved) {
      this.saved = result.oooSaved;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ oooSaved: this.saved });
  }

  applyTemplate(type) {
    const template = this.templates[type];
    if (template) {
      this.messageEl.value = template
        .replace('{returnDate}', '')
        .replace('{contact}', '');
    }
  }

  formatMessage() {
    let message = this.messageEl.value.trim();
    const returnDate = this.returnDateEl.value;
    const contact = this.contactEl.value.trim();

    if (returnDate) {
      const date = new Date(returnDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      message = message.replace('{returnDate}', ` on ${date}`);
    } else {
      message = message.replace('{returnDate}', '');
    }

    if (contact) {
      message = message.replace('{contact}', `For urgent matters, please contact ${contact}. `);
    } else {
      message = message.replace('{contact}', '');
    }

    return message;
  }

  async copyMessage() {
    const text = this.formatMessage();
    if (!text) return;

    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveMessage() {
    const message = this.messageEl.value.trim();
    if (!message) return;

    const item = {
      id: Date.now(),
      message: message,
      returnDate: this.returnDateEl.value,
      contact: this.contactEl.value.trim()
    };

    this.saved.unshift(item);
    if (this.saved.length > 10) {
      this.saved.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  useMessage(id) {
    const item = this.saved.find(s => s.id === id);
    if (item) {
      this.messageEl.value = item.message;
      this.returnDateEl.value = item.returnDate || '';
      this.contactEl.value = item.contact || '';
    }
  }

  deleteMessage(id) {
    this.saved = this.saved.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.saved.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved messages</div>';
      return;
    }

    this.listEl.innerHTML = this.saved.map(s => `
      <div class="saved-item">
        <span class="saved-preview">${this.escapeHtml(s.message.substring(0, 40))}...</span>
        <div class="saved-actions">
          <button class="use-btn" data-use="${s.id}">Use</button>
          <button class="delete-btn" data-delete="${s.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.useMessage(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMessage(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new OutOfOffice());
