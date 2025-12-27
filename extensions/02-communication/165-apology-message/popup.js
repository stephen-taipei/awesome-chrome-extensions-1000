// Apology Message - Popup Script

class ApologyMessage {
  constructor() {
    this.apologies = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.contextEl = document.getElementById('context');
    this.recipientEl = document.getElementById('recipient');
    this.issueEl = document.getElementById('issue');
    this.resolutionEl = document.getElementById('resolution');
    this.senderEl = document.getElementById('sender');
    this.copyBtn = document.getElementById('copyApology');
    this.saveBtn = document.getElementById('saveApology');
    this.listEl = document.getElementById('apologyList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyApology());
    this.saveBtn.addEventListener('click', () => this.saveApology());
  }

  async loadData() {
    const result = await chrome.storage.local.get('apologyMessages');
    if (result.apologyMessages) {
      this.apologies = result.apologyMessages;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ apologyMessages: this.apologies });
  }

  getContextLabel(context) {
    const labels = {
      professional: 'Professional',
      customer: 'Customer',
      personal: 'Personal',
      delay: 'Delay',
      mistake: 'Mistake',
      miscommunication: 'Miscommunication'
    };
    return labels[context] || context;
  }

  formatApology() {
    const recipient = this.recipientEl.value.trim();
    const issue = this.issueEl.value.trim();
    const resolution = this.resolutionEl.value.trim();
    const sender = this.senderEl.value.trim();

    let message = recipient ? `Dear ${recipient},\n\n` : 'Hi,\n\n';
    message += 'I want to sincerely apologize';

    if (issue) {
      message += ` for ${issue}`;
    }
    message += '. I understand this may have caused inconvenience, and I take full responsibility.\n\n';

    if (resolution) {
      message += `To make things right, ${resolution}\n\n`;
    }

    message += 'I truly value our relationship and will do my best to ensure this doesn\'t happen again. Thank you for your understanding.\n\n';
    message += 'Sincerely,\n';
    message += sender || '[Your name]';

    return message;
  }

  async copyApology() {
    const text = this.formatApology();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveApology() {
    const recipient = this.recipientEl.value.trim();
    const issue = this.issueEl.value.trim();
    if (!recipient && !issue) return;

    const apology = {
      id: Date.now(),
      context: this.contextEl.value,
      recipient,
      issue,
      resolution: this.resolutionEl.value.trim(),
      sender: this.senderEl.value.trim(),
      created: Date.now()
    };

    this.apologies.unshift(apology);
    if (this.apologies.length > 15) {
      this.apologies.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadApology(id) {
    const apology = this.apologies.find(a => a.id === id);
    if (apology) {
      this.contextEl.value = apology.context || 'professional';
      this.recipientEl.value = apology.recipient || '';
      this.issueEl.value = apology.issue || '';
      this.resolutionEl.value = apology.resolution || '';
      this.senderEl.value = apology.sender || '';
    }
  }

  deleteApology(id) {
    this.apologies = this.apologies.filter(a => a.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncate(text, len = 20) {
    if (!text || text.length <= len) return text || '(No recipient)';
    return text.substring(0, len) + '...';
  }

  render() {
    if (this.apologies.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved templates</div>';
      return;
    }

    this.listEl.innerHTML = this.apologies.map(a => `
      <div class="apology-item">
        <div class="apology-info">
          <div class="apology-recipient">${this.escapeHtml(this.truncate(a.recipient || a.issue))}</div>
          <div class="apology-context">${this.getContextLabel(a.context)}</div>
        </div>
        <div class="apology-actions">
          <button class="load-btn" data-load="${a.id}">Load</button>
          <button class="delete-btn" data-delete="${a.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadApology(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteApology(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ApologyMessage());
