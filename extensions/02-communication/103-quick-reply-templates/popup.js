// Quick Reply Templates - Popup Script

class QuickReplyTemplates {
  constructor() {
    this.templates = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.nameEl = document.getElementById('templateName');
    this.contentEl = document.getElementById('templateContent');
    this.addBtn = document.getElementById('addTemplate');
    this.listEl = document.getElementById('templatesList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTemplate());

    this.nameEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.contentEl.focus();
      }
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('replyTemplates');
    if (result.replyTemplates) {
      this.templates = result.replyTemplates;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ replyTemplates: this.templates });
  }

  addTemplate() {
    const name = this.nameEl.value.trim();
    const content = this.contentEl.value.trim();

    if (!name || !content) return;

    this.templates.unshift({
      id: Date.now(),
      name,
      content,
      createdAt: Date.now()
    });

    this.saveData();
    this.render();

    this.nameEl.value = '';
    this.contentEl.value = '';
    this.nameEl.focus();
  }

  async copyTemplate(id) {
    const template = this.templates.find(t => t.id === id);
    if (!template) return;

    await navigator.clipboard.writeText(template.content);

    const btn = document.querySelector(`[data-copy="${id}"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = original, 1000);
    }
  }

  deleteTemplate(id) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.templates.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No templates yet. Add one above!</div>';
      return;
    }

    this.listEl.innerHTML = this.templates.map(template => `
      <div class="template-item">
        <div class="template-header">
          <span class="template-name">${this.escapeHtml(template.name)}</span>
          <div class="template-actions">
            <button class="copy-btn" data-copy="${template.id}">Copy</button>
            <button class="delete-btn" data-delete="${template.id}">Delete</button>
          </div>
        </div>
        <div class="template-content">${this.escapeHtml(template.content)}</div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyTemplate(parseInt(btn.dataset.copy)));
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

document.addEventListener('DOMContentLoaded', () => new QuickReplyTemplates());
