// Email Template - Popup Script

const categoryLabels = {
  work: '工作',
  personal: '個人',
  sales: '銷售',
  support: '客服'
};

class EmailTemplate {
  constructor() {
    this.data = {
      templates: []
    };
    this.currentFilter = 'all';
    this.editingId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.searchInput = document.getElementById('searchInput');
    this.addNewBtn = document.getElementById('addNewBtn');
    this.catTabs = document.querySelectorAll('.cat-tab');
    this.templatesList = document.getElementById('templatesList');
    this.formSection = document.getElementById('formSection');
    this.formTitle = document.getElementById('formTitle');
    this.closeFormBtn = document.getElementById('closeFormBtn');
    this.templateName = document.getElementById('templateName');
    this.templateCategory = document.getElementById('templateCategory');
    this.templateSubject = document.getElementById('templateSubject');
    this.templateContent = document.getElementById('templateContent');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.searchInput.addEventListener('input', () => this.renderTemplates());

    this.addNewBtn.addEventListener('click', () => this.showForm());

    this.catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.category;
        this.renderTemplates();
      });
    });

    this.closeFormBtn.addEventListener('click', () => this.hideForm());

    this.saveBtn.addEventListener('click', () => this.saveTemplate());
  }

  async loadData() {
    const result = await chrome.storage.local.get('emailTemplateData');
    if (result.emailTemplateData) {
      this.data = result.emailTemplateData;
    }
    this.renderTemplates();
  }

  async saveData() {
    await chrome.storage.local.set({ emailTemplateData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  showForm(template = null) {
    this.formSection.classList.remove('hidden');

    if (template) {
      this.editingId = template.id;
      this.formTitle.textContent = '編輯模板';
      this.templateName.value = template.name;
      this.templateCategory.value = template.category;
      this.templateSubject.value = template.subject;
      this.templateContent.value = template.content;
    } else {
      this.editingId = null;
      this.formTitle.textContent = '新增模板';
      this.templateName.value = '';
      this.templateCategory.value = 'work';
      this.templateSubject.value = '';
      this.templateContent.value = '';
    }
  }

  hideForm() {
    this.formSection.classList.add('hidden');
    this.editingId = null;
  }

  async saveTemplate() {
    const name = this.templateName.value.trim();
    const category = this.templateCategory.value;
    const subject = this.templateSubject.value.trim();
    const content = this.templateContent.value.trim();

    if (!name || !content) {
      this.saveBtn.textContent = '請填寫必填欄位';
      setTimeout(() => {
        this.saveBtn.textContent = '儲存模板';
      }, 1500);
      return;
    }

    if (this.editingId) {
      const index = this.data.templates.findIndex(t => t.id === this.editingId);
      if (index !== -1) {
        this.data.templates[index] = {
          ...this.data.templates[index],
          name,
          category,
          subject,
          content,
          updatedAt: Date.now()
        };
      }
    } else {
      this.data.templates.unshift({
        id: this.generateId(),
        name,
        category,
        subject,
        content,
        createdAt: Date.now(),
        usageCount: 0
      });
    }

    await this.saveData();

    this.saveBtn.textContent = '已儲存 ✓';
    setTimeout(() => {
      this.hideForm();
      this.saveBtn.textContent = '儲存模板';
      this.renderTemplates();
    }, 800);
  }

  async deleteTemplate(id) {
    this.data.templates = this.data.templates.filter(t => t.id !== id);
    await this.saveData();
    this.renderTemplates();
  }

  async copyTemplate(template) {
    const fullContent = template.subject
      ? `主旨: ${template.subject}\n\n${template.content}`
      : template.content;

    try {
      await navigator.clipboard.writeText(fullContent);

      // Update usage count
      const t = this.data.templates.find(item => item.id === template.id);
      if (t) {
        t.usageCount = (t.usageCount || 0) + 1;
        await this.saveData();
      }

      // Show feedback
      const card = document.querySelector(`[data-id="${template.id}"] .copy`);
      if (card) {
        card.textContent = '已複製!';
        setTimeout(() => {
          card.textContent = '複製';
        }, 1500);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
  }

  renderTemplates() {
    const searchTerm = this.searchInput.value.toLowerCase();

    let templates = this.data.templates;

    if (this.currentFilter !== 'all') {
      templates = templates.filter(t => t.category === this.currentFilter);
    }

    if (searchTerm) {
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm) ||
        t.subject.toLowerCase().includes(searchTerm) ||
        t.content.toLowerCase().includes(searchTerm)
      );
    }

    this.templatesList.innerHTML = templates.map(template => `
      <div class="template-card" data-id="${template.id}">
        <div class="template-header">
          <span class="template-name">${template.name}</span>
          <span class="template-category">${categoryLabels[template.category]}</span>
        </div>
        ${template.subject ? `<div class="template-subject">主旨: ${template.subject}</div>` : ''}
        <div class="template-preview">${template.content}</div>
        <div class="template-actions">
          <button class="action-btn copy">複製</button>
          <button class="action-btn edit">編輯</button>
          <button class="action-btn delete">刪除</button>
        </div>
      </div>
    `).join('');

    // Bind events
    this.templatesList.querySelectorAll('.template-card').forEach(card => {
      const id = card.dataset.id;
      const template = this.data.templates.find(t => t.id === id);

      card.querySelector('.copy').addEventListener('click', (e) => {
        e.stopPropagation();
        this.copyTemplate(template);
      });

      card.querySelector('.edit').addEventListener('click', (e) => {
        e.stopPropagation();
        this.showForm(template);
      });

      card.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteTemplate(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new EmailTemplate();
});
