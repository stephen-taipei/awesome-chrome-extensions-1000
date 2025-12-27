// Comment Templates - Popup Script

class CommentTemplates {
  constructor() {
    this.templates = [];
    this.currentCategory = 'all';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.categoryEl = document.getElementById('category');
    this.nameEl = document.getElementById('name');
    this.contentEl = document.getElementById('content');
    this.addBtn = document.getElementById('addTemplate');
    this.listEl = document.getElementById('templatesList');
    this.tabs = document.querySelectorAll('.tab');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTemplate());
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchCategory(tab.dataset.category));
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('commentTemplates');
    if (result.commentTemplates) {
      this.templates = result.commentTemplates;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ commentTemplates: this.templates });
  }

  switchCategory(category) {
    this.currentCategory = category;
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });
    this.render();
  }

  addTemplate() {
    const category = this.categoryEl.value;
    const name = this.nameEl.value.trim();
    const content = this.contentEl.value.trim();

    if (!name || !content) return;

    this.templates.unshift({
      id: Date.now(),
      category,
      name,
      content
    });

    if (this.templates.length > 50) {
      this.templates.pop();
    }

    this.nameEl.value = '';
    this.contentEl.value = '';
    this.saveData();
    this.render();
  }

  async copyTemplate(id) {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      await navigator.clipboard.writeText(template.content);
      this.showCopied(id);
    }
  }

  showCopied(id) {
    const btn = this.listEl.querySelector(`[data-copy="${id}"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  }

  deleteTemplate(id) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveData();
    this.render();
  }

  getFilteredTemplates() {
    if (this.currentCategory === 'all') {
      return this.templates;
    }
    return this.templates.filter(t => t.category === this.currentCategory);
  }

  render() {
    const filtered = this.getFilteredTemplates();

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No templates found</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(t => `
      <div class="template-item">
        <div class="template-header">
          <span class="template-name">${this.escapeHtml(t.name)}</span>
          <span class="template-category">${t.category}</span>
        </div>
        <div class="template-content">${this.escapeHtml(t.content)}</div>
        <div class="template-actions">
          <button class="copy-btn" data-copy="${t.id}">Copy</button>
          <button class="delete-btn" data-delete="${t.id}">Delete</button>
        </div>
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

document.addEventListener('DOMContentLoaded', () => new CommentTemplates());
