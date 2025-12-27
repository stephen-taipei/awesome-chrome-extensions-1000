// Priority Matrix - Popup Script

class PriorityMatrix {
  constructor() {
    this.tasks = {
      do: [],
      schedule: [],
      delegate: [],
      delete: []
    };
    this.editingId = null;
    this.initElements();
    this.bindEvents();
    this.loadTasks();
  }

  initElements() {
    // Lists
    this.doList = document.getElementById('doList');
    this.scheduleList = document.getElementById('scheduleList');
    this.delegateList = document.getElementById('delegateList');
    this.deleteList = document.getElementById('deleteList');

    // Counts
    this.doCount = document.getElementById('doCount');
    this.scheduleCount = document.getElementById('scheduleCount');
    this.delegateCount = document.getElementById('delegateCount');
    this.deleteCount = document.getElementById('deleteCount');

    // Modal
    this.addBtn = document.getElementById('addBtn');
    this.modal = document.getElementById('addModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.taskText = document.getElementById('taskText');
    this.saveTaskBtn = document.getElementById('saveTaskBtn');
    this.deleteTaskBtn = document.getElementById('deleteTaskBtn');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.openAddModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.saveTaskBtn.addEventListener('click', () => this.saveTask());
    this.deleteTaskBtn.addEventListener('click', () => this.deleteTask());
    this.taskText.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveTask();
    });
  }

  async loadTasks() {
    const result = await chrome.storage.local.get(['priorityMatrixTasks']);
    if (result.priorityMatrixTasks) {
      this.tasks = result.priorityMatrixTasks;
    }
    this.renderTasks();
  }

  async saveTasks() {
    await chrome.storage.local.set({ priorityMatrixTasks: this.tasks });
  }

  openAddModal(quadrant = 'do') {
    this.editingId = null;
    this.modalTitle.textContent = '新增任務';
    this.deleteTaskBtn.classList.add('hidden');
    this.taskText.value = '';
    document.querySelector(`input[name="quadrant"][value="${quadrant}"]`).checked = true;
    this.modal.classList.remove('hidden');
    this.taskText.focus();
  }

  openEditModal(task, quadrant) {
    this.editingId = task.id;
    this.editingQuadrant = quadrant;
    this.modalTitle.textContent = '編輯任務';
    this.deleteTaskBtn.classList.remove('hidden');
    this.taskText.value = task.text;
    document.querySelector(`input[name="quadrant"][value="${quadrant}"]`).checked = true;
    this.modal.classList.remove('hidden');
    this.taskText.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.editingId = null;
  }

  async saveTask() {
    const text = this.taskText.value.trim();
    if (!text) return;

    const selectedQuadrant = document.querySelector('input[name="quadrant"]:checked').value;

    if (this.editingId) {
      // Remove from old quadrant
      this.tasks[this.editingQuadrant] = this.tasks[this.editingQuadrant].filter(
        t => t.id !== this.editingId
      );

      // Add to new/same quadrant
      const task = {
        id: this.editingId,
        text,
        completed: false
      };
      this.tasks[selectedQuadrant].push(task);
    } else {
      const task = {
        id: Date.now().toString(),
        text,
        completed: false
      };
      this.tasks[selectedQuadrant].push(task);
    }

    await this.saveTasks();
    this.renderTasks();
    this.closeModal();
  }

  async deleteTask() {
    if (!this.editingId) return;

    this.tasks[this.editingQuadrant] = this.tasks[this.editingQuadrant].filter(
      t => t.id !== this.editingId
    );

    await this.saveTasks();
    this.renderTasks();
    this.closeModal();
  }

  async toggleTask(quadrant, taskId) {
    const task = this.tasks[quadrant].find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      await this.saveTasks();
      this.renderTasks();
    }
  }

  renderTasks() {
    this.renderQuadrant('do', this.doList, this.doCount);
    this.renderQuadrant('schedule', this.scheduleList, this.scheduleCount);
    this.renderQuadrant('delegate', this.delegateList, this.delegateCount);
    this.renderQuadrant('delete', this.deleteList, this.deleteCount);
  }

  renderQuadrant(quadrant, listEl, countEl) {
    listEl.innerHTML = '';
    const tasks = this.tasks[quadrant] || [];

    const incompleteCount = tasks.filter(t => !t.completed).length;
    countEl.textContent = incompleteCount;

    if (tasks.length === 0) {
      listEl.innerHTML = '<div class="empty-quadrant">拖曳或點擊 + 新增</div>';
      return;
    }

    // Sort: incomplete first
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return 0;
    });

    sortedTasks.forEach(task => {
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <button class="task-check" data-quadrant="${quadrant}" data-id="${task.id}">
          ${task.completed ? '✓' : ''}
        </button>
        <span class="task-text">${this.escapeHtml(task.text)}</span>
      `;

      // Check button
      const checkBtn = item.querySelector('.task-check');
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTask(quadrant, task.id);
      });

      // Click to edit
      item.addEventListener('click', () => {
        this.openEditModal(task, quadrant);
      });

      listEl.appendChild(item);
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new PriorityMatrix();
});
