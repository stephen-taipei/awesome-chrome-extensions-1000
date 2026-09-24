// Note Templates - Popup Script

const DEFAULT_TEMPLATES = [
  {
    id: 'meeting-1',
    name: '會議記錄',
    category: 'meeting',
    icon: '📋',
    content: `# 會議記錄

日期：{{date}} {{weekday}}
時間：{{time}}

## 出席人員
-

## 議程
1.

## 討論內容


## 決議事項
-

## 待辦事項
- [ ]

## 下次會議
日期：
議題：`
  },
  {
    id: 'weekly-1',
    name: '週報',
    category: 'report',
    icon: '📊',
    content: `# 週報 - {{date}}

## 本週完成
-

## 進行中
-

## 遇到的問題
-

## 下週計畫
-

## 需要支援
- `
  },
  {
    id: 'reading-1',
    name: '讀書筆記',
    category: 'note',
    icon: '📚',
    content: `# 讀書筆記

日期：{{date}}
書名：
作者：

## 重點摘要


## 精彩段落


## 心得感想


## 行動項目
- `
  },
  {
    id: 'daily-1',
    name: '每日日記',
    category: 'journal',
    icon: '📝',
    content: `# {{date}} {{weekday}}

## 今日心情
😄 😊 😐 😔 😢

## 今日完成
-

## 感恩的事
1.
2.
3.

## 明日目標
-

## 自由書寫
`
  },
  {
    id: 'standup-1',
    name: '站立會議',
    category: 'meeting',
    icon: '🧍',
    content: `# Daily Standup - {{date}}

## 昨天完成
-

## 今天計畫
-

## 阻礙/問題
- `
  },
  {
    id: 'brainstorm-1',
    name: '腦力激盪',
    category: 'note',
    icon: '💡',
    content: `# 腦力激盪 - {{date}}

主題：

## 想法列表
1.
2.
3.

## 優點/缺點分析
| 想法 | 優點 | 缺點 |
|------|------|------|
|      |      |      |

## 最終決定

`
  }
];

class NoteTemplates {
  constructor() {
    this.customTemplates = [];
    this.editingTemplate = null;

    this.initElements();
    this.loadCustomTemplates();
    this.bindEvents();
    this.render();
  }

  initElements() {
    this.tabs = document.querySelectorAll('.tab');
    this.templatesView = document.getElementById('templatesView');
    this.customView = document.getElementById('customView');
    this.templatesList = document.getElementById('templatesList');
    this.customList = document.getElementById('customList');
    this.createBtn = document.getElementById('createBtn');

    // Preview Modal
    this.previewModal = document.getElementById('previewModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.previewContent = document.getElementById('previewContent');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.copyBtn = document.getElementById('copyBtn');

    // Editor Modal
    this.editorModal = document.getElementById('editorModal');
    this.editorTitle = document.getElementById('editorTitle');
    this.templateName = document.getElementById('templateName');
    this.templateCategory = document.getElementById('templateCategory');
    this.templateContent = document.getElementById('templateContent');
    this.closeEditorBtn = document.getElementById('closeEditorBtn');
    this.saveTemplateBtn = document.getElementById('saveTemplateBtn');
    this.deleteTemplateBtn = document.getElementById('deleteTemplateBtn');

    this.toast = document.getElementById('toast');
  }

  async loadCustomTemplates() {
    try {
      const result = await chrome.storage.local.get(['customTemplates']);
      this.customTemplates = result.customTemplates || [];
      this.renderCustom();
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }

  async saveCustomTemplates() {
    try {
      await chrome.storage.local.set({ customTemplates: this.customTemplates });
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  processVariables(content) {
    const now = new Date();
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

    return content
      .replace(/\{\{date\}\}/g, now.toLocaleDateString('zh-TW'))
      .replace(/\{\{time\}\}/g, now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }))
      .replace(/\{\{weekday\}\}/g, weekdays[now.getDay()])
      .replace(/\{\{year\}\}/g, now.getFullYear())
      .replace(/\{\{month\}\}/g, now.getMonth() + 1)
      .replace(/\{\{day\}\}/g, now.getDate());
  }

  render() {
    const categoryIcons = {
      meeting: '📋',
      report: '📊',
      note: '📝',
      journal: '📔',
      other: '📄'
    };

    const categoryNames = {
      meeting: '會議',
      report: '報告',
      note: '筆記',
      journal: '日記',
      other: '其他'
    };

    this.templatesList.innerHTML = DEFAULT_TEMPLATES.map(t => `
      <div class="template-item" data-id="${t.id}" data-type="default">
        <div class="template-icon">${t.icon}</div>
        <div class="template-info">
          <div class="template-name">${t.name}</div>
          <div class="template-category">${categoryNames[t.category]}</div>
        </div>
      </div>
    `).join('');
  }

  renderCustom() {
    const categoryNames = {
      meeting: '會議',
      report: '報告',
      note: '筆記',
      journal: '日記',
      other: '其他'
    };

    const categoryIcons = {
      meeting: '📋',
      report: '📊',
      note: '📝',
      journal: '📔',
      other: '📄'
    };

    if (this.customTemplates.length === 0) {
      this.customList.innerHTML = `
        <div class="empty-state">
          <p>尚無自訂範本</p>
          <p>點擊右上角 + 新增</p>
        </div>
      `;
      return;
    }

    this.customList.innerHTML = this.customTemplates.map(t => `
      <div class="template-item" data-id="${t.id}" data-type="custom">
        <div class="template-icon">${categoryIcons[t.category] || '📄'}</div>
        <div class="template-info">
          <div class="template-name">${this.escapeHtml(t.name)}</div>
          <div class="template-category">${categoryNames[t.category]}</div>
        </div>
        <button class="template-action edit-btn" title="編輯">✏️</button>
      </div>
    `).join('');
  }

  switchTab(tabName) {
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    this.templatesView.classList.toggle('active', tabName === 'templates');
    this.customView.classList.toggle('active', tabName === 'custom');
  }

  showPreview(template) {
    this.modalTitle.textContent = template.name;
    this.previewContent.value = this.processVariables(template.content);
    this.previewModal.classList.remove('hidden');
  }

  hidePreview() {
    this.previewModal.classList.add('hidden');
  }

  showEditor(template = null) {
    this.editingTemplate = template;
    this.editorTitle.textContent = template ? '編輯範本' : '新增範本';
    this.deleteTemplateBtn.classList.toggle('hidden', !template);

    if (template) {
      this.templateName.value = template.name;
      this.templateCategory.value = template.category;
      this.templateContent.value = template.content;
    } else {
      this.templateName.value = '';
      this.templateCategory.value = 'note';
      this.templateContent.value = '';
    }

    this.editorModal.classList.remove('hidden');
    this.templateName.focus();
  }

  hideEditor() {
    this.editorModal.classList.add('hidden');
    this.editingTemplate = null;
  }

  async saveTemplate() {
    const name = this.templateName.value.trim();
    const category = this.templateCategory.value;
    const content = this.templateContent.value.trim();

    if (!name) {
      this.showToast('請輸入範本名稱');
      return;
    }

    if (!content) {
      this.showToast('請輸入範本內容');
      return;
    }

    if (this.editingTemplate) {
      // Update existing
      const index = this.customTemplates.findIndex(t => t.id === this.editingTemplate.id);
      if (index !== -1) {
        this.customTemplates[index] = {
          ...this.editingTemplate,
          name,
          category,
          content
        };
      }
    } else {
      // Create new
      this.customTemplates.push({
        id: 'custom-' + Date.now(),
        name,
        category,
        content
      });
    }

    await this.saveCustomTemplates();
    this.renderCustom();
    this.hideEditor();
    this.showToast('範本已儲存', 'success');
  }

  async deleteTemplate() {
    if (!this.editingTemplate) return;

    if (!confirm('確定要刪除此範本嗎？')) return;

    this.customTemplates = this.customTemplates.filter(t => t.id !== this.editingTemplate.id);
    await this.saveCustomTemplates();
    this.renderCustom();
    this.hideEditor();
    this.showToast('範本已刪除', 'success');
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.previewContent.value).then(() => {
      this.showToast('已複製到剪貼簿', 'success');
    }).catch(() => {
      this.showToast('複製失敗');
    });
  }

  escapeHtml(text) {
    return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    // Tab switching
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Create button
    this.createBtn.addEventListener('click', () => this.showEditor());

    // Template list clicks
    this.templatesList.addEventListener('click', (e) => {
      const item = e.target.closest('.template-item');
      if (item) {
        const template = DEFAULT_TEMPLATES.find(t => t.id === item.dataset.id);
        if (template) this.showPreview(template);
      }
    });

    this.customList.addEventListener('click', (e) => {
      const item = e.target.closest('.template-item');
      if (!item) return;

      const template = this.customTemplates.find(t => t.id === item.dataset.id);
      if (!template) return;

      if (e.target.closest('.edit-btn')) {
        this.showEditor(template);
      } else {
        this.showPreview(template);
      }
    });

    // Preview modal
    this.closeModalBtn.addEventListener('click', () => this.hidePreview());
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.previewModal.addEventListener('click', (e) => {
      if (e.target === this.previewModal) this.hidePreview();
    });

    // Editor modal
    this.closeEditorBtn.addEventListener('click', () => this.hideEditor());
    this.saveTemplateBtn.addEventListener('click', () => this.saveTemplate());
    this.deleteTemplateBtn.addEventListener('click', () => this.deleteTemplate());
    this.editorModal.addEventListener('click', (e) => {
      if (e.target === this.editorModal) this.hideEditor();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hidePreview();
        this.hideEditor();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NoteTemplates();
});
