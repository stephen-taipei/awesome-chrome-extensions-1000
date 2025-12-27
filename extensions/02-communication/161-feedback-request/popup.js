// Feedback Request - Popup Script

class FeedbackRequest {
  constructor() {
    this.templates = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('requestType');
    this.nameEl = document.getElementById('itemName');
    this.recipientEl = document.getElementById('recipient');
    this.contextEl = document.getElementById('context');
    this.deadlineEl = document.getElementById('deadline');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveTemplate');
    this.listEl = document.getElementById('templateList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveTemplate());
  }

  async loadData() {
    const result = await chrome.storage.local.get('feedbackRequests');
    if (result.feedbackRequests) {
      this.templates = result.feedbackRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ feedbackRequests: this.templates });
  }

  getTypeLabel(type) {
    const labels = {
      project: 'Project Review',
      presentation: 'Presentation',
      document: 'Document/Report',
      design: 'Design Work',
      code: 'Code Review',
      general: 'General Feedback'
    };
    return labels[type] || type;
  }

  formatRequest() {
    const type = this.typeEl.value;
    const name = this.nameEl.value.trim() || 'my work';
    const recipient = this.recipientEl.value.trim();
    const context = this.contextEl.value.trim();
    const deadline = this.deadlineEl.value.trim();

    let greeting = recipient ? `Hi ${recipient},` : 'Hi,';
    let output = `${greeting}\n\n`;
    output += `I'm reaching out to request your feedback on ${name}.\n\n`;

    if (context) {
      output += `I'd particularly appreciate your thoughts on:\n`;
      output += context.split('\n').map(line => `• ${line.trim()}`).join('\n');
      output += '\n\n';
    }

    if (deadline) {
      output += `If possible, I'd appreciate receiving your feedback by ${deadline}.\n\n`;
    }

    output += `Your insights would be incredibly valuable. Thank you for taking the time!\n\n`;
    output += `Best regards`;

    return output;
  }

  async copyRequest() {
    const text = this.formatRequest();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveTemplate() {
    const name = this.nameEl.value.trim();
    if (!name) return;

    const template = {
      id: Date.now(),
      type: this.typeEl.value,
      name,
      recipient: this.recipientEl.value.trim(),
      context: this.contextEl.value.trim(),
      deadline: this.deadlineEl.value.trim(),
      created: Date.now()
    };

    this.templates.unshift(template);
    if (this.templates.length > 15) {
      this.templates.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadTemplate(id) {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      this.typeEl.value = template.type || 'general';
      this.nameEl.value = template.name || '';
      this.recipientEl.value = template.recipient || '';
      this.contextEl.value = template.context || '';
      this.deadlineEl.value = template.deadline || '';
    }
  }

  deleteTemplate(id) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.templates.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved requests</div>';
      return;
    }

    this.listEl.innerHTML = this.templates.map(t => `
      <div class="template-item">
        <div class="template-info">
          <div class="template-name">${this.escapeHtml(t.name)}</div>
          <div class="template-type">${this.getTypeLabel(t.type)}</div>
        </div>
        <div class="template-actions">
          <button class="load-btn" data-load="${t.id}">Load</button>
          <button class="delete-btn" data-delete="${t.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadTemplate(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteTemplate(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new FeedbackRequest());
