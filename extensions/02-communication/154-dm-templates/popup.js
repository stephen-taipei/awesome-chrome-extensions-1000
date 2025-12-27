// DM Templates - Popup Script

class DMTemplates {
  constructor() {
    this.templates = [];
    this.currentCategory = 'all';
    this.categories = {
      intro: '👋',
      collab: '🤝',
      business: '💼',
      other: '📝'
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.categoryBtns = document.querySelectorAll('.cat-btn');
    this.nameEl = document.getElementById('templateName');
    this.categoryEl = document.getElementById('templateCategory');
    this.textEl = document.getElementById('templateText');
    this.saveBtn = document.getElementById('saveTemplate');
    this.listEl = document.getElementById('templateList');
  }

  bindEvents() {
    this.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setCategory(btn.dataset.category));
    });
    this.saveBtn.addEventListener('click', () => this.saveTemplate());
  }

  async loadData() {
    const result = await chrome.storage.local.get('dmTemplates');
    if (result.dmTemplates) {
      this.templates = result.dmTemplates;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ dmTemplates: this.templates });
  }

  setCategory(category) {
    this.currentCategory = category;
    this.categoryBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    this.render();
  }

  saveTemplate() {
    const name = this.nameEl.value.trim();
    const category = this.categoryEl.value;
    const text = this.textEl.value.trim();

    if (!name || !text) return;

    const template = {
      id: Date.now(),
      name,
      category,
      text,
      created: Date.now()
    };

    this.templates.unshift(template);
    if (this.templates.length > 20) {
      this.templates.pop();
    }

    this.saveData();
    this.render();

    // Clear form
    this.nameEl.value = '';
    this.textEl.value = '';

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  async copyTemplate(id) {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      await navigator.clipboard.writeText(template.text);
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
          <span class="template-category">${this.categories[t.category] || '📝'}</span>
        </div>
        <div class="template-preview">${this.escapeHtml(t.text)}</div>
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
}

document.addEventListener('DOMContentLoaded', () => new DMTemplates());
