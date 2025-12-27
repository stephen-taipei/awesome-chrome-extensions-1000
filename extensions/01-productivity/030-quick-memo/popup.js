// Quick Memo - Popup Script

class QuickMemo {
  constructor() {
    this.memos = [];

    this.initElements();
    this.loadMemos();
    this.bindEvents();
    this.focusInput();
  }

  initElements() {
    this.memoInput = document.getElementById('memoInput');
    this.addBtn = document.getElementById('addBtn');
    this.memoList = document.getElementById('memoList');
    this.memoCount = document.getElementById('memoCount');
    this.clearAllBtn = document.getElementById('clearAllBtn');
    this.emptyState = document.getElementById('emptyState');
  }

  async loadMemos() {
    try {
      const result = await chrome.storage.local.get(['quickMemos']);
      this.memos = result.quickMemos || [];
      this.render();
    } catch (error) {
      console.error('Failed to load memos:', error);
    }
  }

  async saveMemos() {
    try {
      await chrome.storage.local.set({ quickMemos: this.memos });
      this.updateBadge();
    } catch (error) {
      console.error('Failed to save memos:', error);
    }
  }

  updateBadge() {
    const activeCount = this.memos.filter(m => !m.completed).length;
    chrome.runtime.sendMessage({
      type: 'updateBadge',
      count: activeCount
    });
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) {
      return '剛剛';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分鐘前`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小時前`;
    }

    // Same year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString('zh-TW');
  }

  render() {
    const activeMemos = this.memos.filter(m => !m.completed);
    const completedMemos = this.memos.filter(m => m.completed);

    // Sort: active first (newest first), then completed (newest first)
    const sortedMemos = [
      ...activeMemos.sort((a, b) => b.createdAt - a.createdAt),
      ...completedMemos.sort((a, b) => b.createdAt - a.createdAt)
    ];

    this.memoCount.textContent = activeMemos.length;

    if (this.memos.length === 0) {
      this.memoList.innerHTML = '';
      this.emptyState.classList.add('visible');
      return;
    }

    this.emptyState.classList.remove('visible');
    this.memoList.innerHTML = sortedMemos.map(memo => `
      <div class="memo-item ${memo.completed ? 'completed' : ''}" data-id="${memo.id}">
        <button class="memo-check" title="標記完成">${memo.completed ? '✓' : ''}</button>
        <div class="memo-content">
          <div class="memo-text">${this.escapeHtml(memo.text)}</div>
          <div class="memo-time">${this.formatTime(memo.createdAt)}</div>
        </div>
        <button class="memo-delete" title="刪除">×</button>
      </div>
    `).join('');
  }

  addMemo() {
    const text = this.memoInput.value.trim();
    if (!text) return;

    const memo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now()
    };

    this.memos.unshift(memo);
    this.saveMemos();
    this.render();

    this.memoInput.value = '';
    this.memoInput.focus();
  }

  toggleMemo(id) {
    const memo = this.memos.find(m => m.id === id);
    if (memo) {
      memo.completed = !memo.completed;
      this.saveMemos();
      this.render();
    }
  }

  deleteMemo(id) {
    this.memos = this.memos.filter(m => m.id !== id);
    this.saveMemos();
    this.render();
  }

  clearAll() {
    if (this.memos.length === 0) return;

    if (!confirm('確定要清除所有備忘錄嗎？')) return;

    this.memos = [];
    this.saveMemos();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  focusInput() {
    setTimeout(() => this.memoInput.focus(), 100);
  }

  bindEvents() {
    // Add button
    this.addBtn.addEventListener('click', () => this.addMemo());

    // Input keyboard
    this.memoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.addMemo();
      }
    });

    // Clear all
    this.clearAllBtn.addEventListener('click', () => this.clearAll());

    // Memo list clicks
    this.memoList.addEventListener('click', (e) => {
      const item = e.target.closest('.memo-item');
      if (!item) return;

      const id = item.dataset.id;

      if (e.target.closest('.memo-check')) {
        this.toggleMemo(id);
      } else if (e.target.closest('.memo-delete')) {
        this.deleteMemo(id);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new QuickMemo();
});
