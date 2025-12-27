// Text Expander - Popup Script

const categoryLabels = {
  general: '一般',
  email: '郵件',
  code: '程式碼',
  social: '社交'
};

class TextExpander {
  constructor() {
    this.data = {
      snippets: [],
      totalUsage: 0
    };
    this.editingId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.addBtn = document.getElementById('addBtn');
    this.searchInput = document.getElementById('searchInput');
    this.snippetsList = document.getElementById('snippetsList');
    this.formSection = document.getElementById('formSection');
    this.formTitle = document.getElementById('formTitle');
    this.closeFormBtn = document.getElementById('closeFormBtn');
    this.triggerInput = document.getElementById('triggerInput');
    this.contentInput = document.getElementById('contentInput');
    this.categorySelect = document.getElementById('categorySelect');
    this.saveBtn = document.getElementById('saveBtn');
    this.snippetCountEl = document.getElementById('snippetCount');
    this.usageCountEl = document.getElementById('usageCount');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.showForm());
    this.closeFormBtn.addEventListener('click', () => this.hideForm());
    this.saveBtn.addEventListener('click', () => this.saveSnippet());
    this.searchInput.addEventListener('input', () => this.renderSnippets());

    // Auto-add / prefix
    this.triggerInput.addEventListener('input', () => {
      let value = this.triggerInput.value;
      if (value && !value.startsWith('/')) {
        this.triggerInput.value = '/' + value;
      }
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('textExpanderData');
    if (result.textExpanderData) {
      this.data = result.textExpanderData;
    }
    this.renderSnippets();
    this.updateStats();
  }

  async saveData() {
    await chrome.storage.local.set({ textExpanderData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  showForm(snippet = null) {
    this.formSection.classList.remove('hidden');

    if (snippet) {
      this.editingId = snippet.id;
      this.formTitle.textContent = '編輯捷徑';
      this.triggerInput.value = snippet.trigger;
      this.contentInput.value = snippet.content;
      this.categorySelect.value = snippet.category;
    } else {
      this.editingId = null;
      this.formTitle.textContent = '新增捷徑';
      this.triggerInput.value = '/';
      this.contentInput.value = '';
      this.categorySelect.value = 'general';
    }

    this.triggerInput.focus();
  }

  hideForm() {
    this.formSection.classList.add('hidden');
    this.editingId = null;
  }

  async saveSnippet() {
    const trigger = this.triggerInput.value.trim();
    const content = this.contentInput.value.trim();
    const category = this.categorySelect.value;

    if (!trigger || trigger === '/' || !content) {
      this.saveBtn.textContent = '請填寫必填欄位';
      setTimeout(() => {
        this.saveBtn.textContent = '儲存捷徑';
      }, 1500);
      return;
    }

    // Check for duplicate trigger
    const duplicate = this.data.snippets.find(s =>
      s.trigger === trigger && s.id !== this.editingId
    );
    if (duplicate) {
      this.saveBtn.textContent = '觸發詞已存在';
      setTimeout(() => {
        this.saveBtn.textContent = '儲存捷徑';
      }, 1500);
      return;
    }

    if (this.editingId) {
      const index = this.data.snippets.findIndex(s => s.id === this.editingId);
      if (index !== -1) {
        this.data.snippets[index] = {
          ...this.data.snippets[index],
          trigger,
          content,
          category,
          updatedAt: Date.now()
        };
      }
    } else {
      this.data.snippets.unshift({
        id: this.generateId(),
        trigger,
        content,
        category,
        usageCount: 0,
        createdAt: Date.now()
      });
    }

    await this.saveData();

    this.saveBtn.textContent = '已儲存 ✓';
    setTimeout(() => {
      this.hideForm();
      this.saveBtn.textContent = '儲存捷徑';
      this.renderSnippets();
      this.updateStats();
    }, 800);
  }

  async copySnippet(snippet) {
    try {
      await navigator.clipboard.writeText(snippet.content);

      // Update usage
      const s = this.data.snippets.find(item => item.id === snippet.id);
      if (s) {
        s.usageCount = (s.usageCount || 0) + 1;
        this.data.totalUsage = (this.data.totalUsage || 0) + 1;
        await this.saveData();
        this.updateStats();
      }

      const btn = document.querySelector(`[data-id="${snippet.id}"] .copy`);
      if (btn) {
        btn.textContent = '已複製!';
        setTimeout(() => {
          btn.textContent = '複製';
        }, 1500);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  async deleteSnippet(id) {
    this.data.snippets = this.data.snippets.filter(s => s.id !== id);
    await this.saveData();
    this.renderSnippets();
    this.updateStats();
  }

  updateStats() {
    this.snippetCountEl.textContent = `${this.data.snippets.length} 個捷徑`;
    this.usageCountEl.textContent = `已使用 ${this.data.totalUsage || 0} 次`;
  }

  renderSnippets() {
    const searchTerm = this.searchInput.value.toLowerCase();

    let snippets = this.data.snippets;

    if (searchTerm) {
      snippets = snippets.filter(s =>
        s.trigger.toLowerCase().includes(searchTerm) ||
        s.content.toLowerCase().includes(searchTerm)
      );
    }

    this.snippetsList.innerHTML = snippets.map(snippet => `
      <div class="snippet-card" data-id="${snippet.id}">
        <div class="snippet-header">
          <span class="snippet-trigger">${snippet.trigger}</span>
          <span class="snippet-category">${categoryLabels[snippet.category]}</span>
        </div>
        <div class="snippet-content">${snippet.content}</div>
        <div class="snippet-actions">
          <button class="action-btn copy">複製</button>
          <button class="action-btn edit">編輯</button>
          <button class="action-btn delete">×</button>
        </div>
      </div>
    `).join('');

    // Bind events
    this.snippetsList.querySelectorAll('.snippet-card').forEach(card => {
      const id = card.dataset.id;
      const snippet = this.data.snippets.find(s => s.id === id);

      card.querySelector('.copy').addEventListener('click', (e) => {
        e.stopPropagation();
        this.copySnippet(snippet);
      });

      card.querySelector('.edit').addEventListener('click', (e) => {
        e.stopPropagation();
        this.showForm(snippet);
      });

      card.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteSnippet(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TextExpander();
});
