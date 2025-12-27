// Task Inbox - Popup Script

class TaskInbox {
  constructor() {
    this.tasks = [];
    this.initElements();
    this.bindEvents();
    this.loadTasks();
  }

  initElements() {
    this.taskInput = document.getElementById('taskInput');
    this.addBtn = document.getElementById('addBtn');
    this.taskList = document.getElementById('taskList');
    this.emptyState = document.getElementById('emptyState');
    this.taskCount = document.getElementById('taskCount');
    this.clearAllBtn = document.getElementById('clearAllBtn');
    this.exportBtn = document.getElementById('exportBtn');

    // Create toast element
    this.toast = document.createElement('div');
    this.toast.className = 'toast';
    document.body.appendChild(this.toast);
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
    this.clearAllBtn.addEventListener('click', () => this.clearAll());
    this.exportBtn.addEventListener('click', () => this.exportTasks());
  }

  async loadTasks() {
    const result = await chrome.storage.local.get(['inboxTasks']);
    this.tasks = result.inboxTasks || [];
    this.renderTasks();
    this.updateBadge();
  }

  async saveTasks() {
    await chrome.storage.local.set({ inboxTasks: this.tasks });
    this.updateBadge();
  }

  addTask() {
    const text = this.taskInput.value.trim();
    if (!text) return;

    const task = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.renderTasks();

    this.taskInput.value = '';
    this.taskInput.focus();

    this.showToast('已新增任務');
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.renderTasks();
    this.showToast('已刪除');
  }

  clearAll() {
    if (this.tasks.length === 0) return;

    this.tasks = [];
    this.saveTasks();
    this.renderTasks();
    this.showToast('已清空全部');
  }

  exportTasks() {
    const incompleteTasks = this.tasks.filter(t => !t.completed);
    if (incompleteTasks.length === 0) {
      this.showToast('沒有待處理任務');
      return;
    }

    const text = incompleteTasks.map(t => `• ${t.text}`).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('已複製到剪貼簿');
    }).catch(() => {
      this.showToast('複製失敗');
    });
  }

  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '剛剛';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分鐘前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小時前`;
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  renderTasks() {
    this.taskList.innerHTML = '';

    const incompleteCount = this.tasks.filter(t => !t.completed).length;
    this.taskCount.textContent = incompleteCount;

    // Update button states
    this.clearAllBtn.disabled = this.tasks.length === 0;
    this.exportBtn.disabled = incompleteCount === 0;

    // Toggle empty state
    if (this.tasks.length === 0) {
      this.emptyState.classList.remove('hidden');
      return;
    } else {
      this.emptyState.classList.add('hidden');
    }

    // Sort: incomplete first, then by creation time
    const sortedTasks = [...this.tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    sortedTasks.forEach(task => {
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'completed' : ''}`;

      item.innerHTML = `
        <button class="task-check" data-id="${task.id}">
          ${task.completed ? '✓' : ''}
        </button>
        <span class="task-text">${this.escapeHtml(task.text)}</span>
        <span class="task-time">${this.formatTime(task.createdAt)}</span>
        <button class="task-delete" data-id="${task.id}">✕</button>
      `;

      // Event listeners
      const checkBtn = item.querySelector('.task-check');
      checkBtn.addEventListener('click', () => this.toggleTask(task.id));

      const deleteBtn = item.querySelector('.task-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteTask(task.id);
      });

      this.taskList.appendChild(item);
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.add('show');

    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2000);
  }

  updateBadge() {
    const incompleteCount = this.tasks.filter(t => !t.completed).length;
    chrome.runtime.sendMessage({
      type: 'updateBadge',
      count: incompleteCount
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TaskInbox();
});
