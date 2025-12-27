// Outline Notes - Popup Script

class OutlineNotes {
  constructor() {
    this.items = [];
    this.saveTimeout = null;
    this.searchQuery = '';
    this.draggedItem = null;

    this.initElements();
    this.loadData();
    this.bindEvents();
  }

  initElements() {
    this.outlineEl = document.getElementById('outline');
    this.searchInput = document.getElementById('searchInput');
    this.addRootBtn = document.getElementById('addRootBtn');
    this.expandAllBtn = document.getElementById('expandAllBtn');
    this.collapseAllBtn = document.getElementById('collapseAllBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.toast = document.getElementById('toast');
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['outlineItems']);
      this.items = result.outlineItems || [];

      if (this.items.length === 0) {
        // Add welcome item
        this.items = [{
          id: this.generateId(),
          text: '歡迎使用 Outline Notes！',
          collapsed: false,
          completed: false,
          children: [
            { id: this.generateId(), text: '使用 Enter 新增同級項目', collapsed: false, completed: false, children: [] },
            { id: this.generateId(), text: '使用 Tab 將項目縮排', collapsed: false, completed: false, children: [] },
            { id: this.generateId(), text: '使用 Shift+Tab 取消縮排', collapsed: false, completed: false, children: [] },
            { id: this.generateId(), text: '點擊箭頭可摺疊/展開', collapsed: false, completed: false, children: [] }
          ]
        }];
      }

      this.render();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async saveData() {
    try {
      await chrome.storage.local.set({ outlineItems: this.items });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  scheduleSave() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveData(), 500);
  }

  render() {
    if (this.items.length === 0) {
      this.outlineEl.innerHTML = `
        <div class="empty-state">
          <p>還沒有任何筆記</p>
          <p>點擊下方按鈕開始</p>
        </div>
      `;
      return;
    }

    this.outlineEl.innerHTML = this.renderItems(this.items, 0);
    this.bindItemEvents();
  }

  renderItems(items, level) {
    return items.map((item, index) => {
      const hasChildren = item.children && item.children.length > 0;
      const isCollapsed = item.collapsed;
      const matchesSearch = this.matchesSearch(item);
      const childrenMatch = this.childrenMatchSearch(item);

      if (this.searchQuery && !matchesSearch && !childrenMatch) {
        return '';
      }

      const textHtml = this.searchQuery
        ? this.highlightText(item.text)
        : this.escapeHtml(item.text);

      return `
        <div class="outline-item" data-id="${item.id}" data-level="${level}" data-index="${index}">
          <div class="outline-row" draggable="true">
            <button class="toggle-btn ${isCollapsed ? 'collapsed' : ''} ${!hasChildren ? 'hidden' : ''}"
                    title="${isCollapsed ? '展開' : '摺疊'}">▼</button>
            <div class="bullet"></div>
            <div class="item-content">
              <textarea class="item-text ${item.completed ? 'completed' : ''}"
                        rows="1"
                        data-id="${item.id}">${this.escapeHtml(item.text)}</textarea>
            </div>
            <div class="item-actions">
              <button class="item-action-btn complete-btn" title="標記完成" data-id="${item.id}">✓</button>
              <button class="item-action-btn delete-btn" title="刪除" data-id="${item.id}">×</button>
            </div>
          </div>
          <div class="children ${isCollapsed ? 'collapsed' : ''}">
            ${hasChildren ? this.renderItems(item.children, level + 1) : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  matchesSearch(item) {
    if (!this.searchQuery) return true;
    return item.text.toLowerCase().includes(this.searchQuery.toLowerCase());
  }

  childrenMatchSearch(item) {
    if (!item.children || item.children.length === 0) return false;
    return item.children.some(child =>
      this.matchesSearch(child) || this.childrenMatchSearch(child)
    );
  }

  highlightText(text) {
    if (!this.searchQuery) return this.escapeHtml(text);
    const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
    return this.escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  findItem(items, id) {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  findParentAndIndex(items, id, parent = null) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return { parent, array: items, index: i };
      }
      if (items[i].children) {
        const result = this.findParentAndIndex(items[i].children, id, items[i]);
        if (result) return result;
      }
    }
    return null;
  }

  addItem(afterId = null, asChild = false) {
    const newItem = {
      id: this.generateId(),
      text: '',
      collapsed: false,
      completed: false,
      children: []
    };

    if (!afterId) {
      this.items.push(newItem);
    } else if (asChild) {
      const parentItem = this.findItem(this.items, afterId);
      if (parentItem) {
        parentItem.children = parentItem.children || [];
        parentItem.children.push(newItem);
        parentItem.collapsed = false;
      }
    } else {
      const result = this.findParentAndIndex(this.items, afterId);
      if (result) {
        result.array.splice(result.index + 1, 0, newItem);
      }
    }

    this.scheduleSave();
    this.render();

    // Focus new item
    setTimeout(() => {
      const textarea = this.outlineEl.querySelector(`textarea[data-id="${newItem.id}"]`);
      if (textarea) textarea.focus();
    }, 10);
  }

  updateItemText(id, text) {
    const item = this.findItem(this.items, id);
    if (item) {
      item.text = text;
      this.scheduleSave();
    }
  }

  deleteItem(id) {
    const result = this.findParentAndIndex(this.items, id);
    if (result) {
      result.array.splice(result.index, 1);
      this.scheduleSave();
      this.render();
    }
  }

  toggleComplete(id) {
    const item = this.findItem(this.items, id);
    if (item) {
      item.completed = !item.completed;
      this.scheduleSave();
      this.render();
    }
  }

  toggleCollapse(id) {
    const item = this.findItem(this.items, id);
    if (item) {
      item.collapsed = !item.collapsed;
      this.scheduleSave();
      this.render();
    }
  }

  indent(id) {
    const result = this.findParentAndIndex(this.items, id);
    if (result && result.index > 0) {
      const item = result.array.splice(result.index, 1)[0];
      const prevSibling = result.array[result.index - 1];
      prevSibling.children = prevSibling.children || [];
      prevSibling.children.push(item);
      prevSibling.collapsed = false;
      this.scheduleSave();
      this.render();

      setTimeout(() => {
        const textarea = this.outlineEl.querySelector(`textarea[data-id="${id}"]`);
        if (textarea) textarea.focus();
      }, 10);
    }
  }

  outdent(id) {
    const result = this.findParentAndIndex(this.items, id);
    if (result && result.parent) {
      const item = result.array.splice(result.index, 1)[0];
      const grandResult = this.findParentAndIndex(this.items, result.parent.id);
      if (grandResult) {
        grandResult.array.splice(grandResult.index + 1, 0, item);
        this.scheduleSave();
        this.render();

        setTimeout(() => {
          const textarea = this.outlineEl.querySelector(`textarea[data-id="${id}"]`);
          if (textarea) textarea.focus();
        }, 10);
      }
    }
  }

  expandAll() {
    const expand = (items) => {
      items.forEach(item => {
        item.collapsed = false;
        if (item.children) expand(item.children);
      });
    };
    expand(this.items);
    this.scheduleSave();
    this.render();
  }

  collapseAll() {
    const collapse = (items) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.collapsed = true;
        }
        if (item.children) collapse(item.children);
      });
    };
    collapse(this.items);
    this.scheduleSave();
    this.render();
  }

  exportOutline() {
    const toText = (items, level = 0) => {
      return items.map(item => {
        const indent = '  '.repeat(level);
        const prefix = level === 0 ? '• ' : '- ';
        let text = indent + prefix + item.text;
        if (item.children && item.children.length > 0) {
          text += '\n' + toText(item.children, level + 1);
        }
        return text;
      }).join('\n');
    };

    const content = toText(this.items);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `outline-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();

    URL.revokeObjectURL(url);
    this.showToast('已匯出大綱', 'success');
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    this.addRootBtn.addEventListener('click', () => this.addItem());
    this.expandAllBtn.addEventListener('click', () => this.expandAll());
    this.collapseAllBtn.addEventListener('click', () => this.collapseAll());
    this.exportBtn.addEventListener('click', () => this.exportOutline());

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.render();
    });
  }

  bindItemEvents() {
    // Toggle collapse
    this.outlineEl.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.outline-item');
        if (itemEl) this.toggleCollapse(itemEl.dataset.id);
      });
    });

    // Text input
    this.outlineEl.querySelectorAll('.item-text').forEach(textarea => {
      // Auto-resize
      const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      };
      resize();

      textarea.addEventListener('input', (e) => {
        resize();
        this.updateItemText(e.target.dataset.id, e.target.value);
      });

      textarea.addEventListener('keydown', (e) => {
        const id = e.target.dataset.id;

        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.addItem(id);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (e.shiftKey) {
            this.outdent(id);
          } else {
            this.indent(id);
          }
        } else if (e.key === 'Backspace' && e.target.value === '') {
          e.preventDefault();
          this.deleteItem(id);
        }
      });
    });

    // Complete button
    this.outlineEl.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleComplete(btn.dataset.id);
      });
    });

    // Delete button
    this.outlineEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('確定刪除此項目？')) {
          this.deleteItem(btn.dataset.id);
        }
      });
    });

    // Drag and drop
    this.outlineEl.querySelectorAll('.outline-row').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        const itemEl = e.target.closest('.outline-item');
        this.draggedItem = itemEl.dataset.id;
        row.classList.add('dragging');
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        this.outlineEl.querySelectorAll('.drag-over').forEach(el => {
          el.classList.remove('drag-over');
        });
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        row.classList.add('drag-over');
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');

        const targetItemEl = e.target.closest('.outline-item');
        if (targetItemEl && this.draggedItem && this.draggedItem !== targetItemEl.dataset.id) {
          this.moveItem(this.draggedItem, targetItemEl.dataset.id);
        }
        this.draggedItem = null;
      });
    });
  }

  moveItem(fromId, toId) {
    const fromResult = this.findParentAndIndex(this.items, fromId);
    if (!fromResult) return;

    const item = fromResult.array.splice(fromResult.index, 1)[0];
    const toResult = this.findParentAndIndex(this.items, toId);
    if (toResult) {
      toResult.array.splice(toResult.index, 0, item);
      this.scheduleSave();
      this.render();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OutlineNotes();
});
