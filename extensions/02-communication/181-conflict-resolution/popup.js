// Conflict Resolution - Popup Script

class ConflictResolution {
  constructor() {
    this.messages = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('conflictType');
    this.recipientEl = document.getElementById('recipient');
    this.issueEl = document.getElementById('issue');
    this.perspectiveEl = document.getElementById('perspective');
    this.solutionEl = document.getElementById('solution');
    this.copyBtn = document.getElementById('copyMessage');
    this.saveBtn = document.getElementById('saveMessage');
    this.listEl = document.getElementById('messageList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyMessage());
    this.saveBtn.addEventListener('click', () => this.saveMessage());
  }

  async loadData() {
    const result = await chrome.storage.local.get('conflictMessages');
    if (result.conflictMessages) {
      this.messages = result.conflictMessages;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ conflictMessages: this.messages });
  }

  getTypeLabel(type) {
    const labels = {
      workplace: 'Workplace',
      team: 'Team',
      client: 'Client',
      misunderstanding: 'Misunderstanding',
      deadline: 'Deadline',
      personal: 'Personal'
    };
    return labels[type] || type;
  }

  formatMessage() {
    const recipient = this.recipientEl.value.trim();
    const issue = this.issueEl.value.trim();
    const perspective = this.perspectiveEl.value.trim();
    const solution = this.solutionEl.value.trim();

    let message = `Hi${recipient ? ` ${recipient}` : ''},\n\n`;
    message += 'I wanted to reach out to discuss something that has been on my mind.\n\n';

    if (issue) {
      message += `Regarding ${issue}, I believe it\'s important that we address this openly and find a path forward together.\n\n`;
    }

    if (perspective) {
      message += `I understand that ${perspective}. Your viewpoint is valid and I appreciate you sharing it.\n\n`;
    }

    if (solution) {
      message += `Moving forward, I suggest ${solution}. I believe this could help us find common ground.\n\n`;
    }

    message += 'I value our relationship and am committed to working through this constructively. Would you be open to discussing this further?\n\n';
    message += 'Thank you for taking the time to consider this.\n\n';
    message += 'Best regards';

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
    const recipient = this.recipientEl.value.trim();
    if (!recipient) return;

    const message = {
      id: Date.now(),
      type: this.typeEl.value,
      recipient,
      issue: this.issueEl.value.trim(),
      perspective: this.perspectiveEl.value.trim(),
      solution: this.solutionEl.value.trim(),
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
      this.typeEl.value = message.type || 'workplace';
      this.recipientEl.value = message.recipient || '';
      this.issueEl.value = message.issue || '';
      this.perspectiveEl.value = message.perspective || '';
      this.solutionEl.value = message.solution || '';
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
          <div class="message-recipient">${this.escapeHtml(this.truncate(m.recipient))}</div>
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

document.addEventListener('DOMContentLoaded', () => new ConflictResolution());
