// Task Delegator - Popup Script

class TaskDelegator {
  constructor() {
    this.data = {
      members: [],
      tasks: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.pendingCountEl = document.getElementById('pendingCount');
    this.inProgressCountEl = document.getElementById('inProgressCount');
    this.completedCountEl = document.getElementById('completedCount');
    this.taskTitleEl = document.getElementById('taskTitle');
    this.assigneeEl = document.getElementById('assignee');
    this.priorityEl = document.getElementById('priority');
    this.addTaskBtn = document.getElementById('addTaskBtn');
    this.addMemberBtn = document.getElementById('addMemberBtn');
    this.teamListEl = document.getElementById('teamList');
    this.tasksListEl = document.getElementById('tasksList');
    this.modal = document.getElementById('modal');
    this.memberNameEl = document.getElementById('memberName');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.addMemberBtn.addEventListener('click', () => this.openModal());
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.saveBtn.addEventListener('click', () => this.saveMember());
    this.taskTitleEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('taskDelegatorData');
    if (result.taskDelegatorData) {
      this.data = result.taskDelegatorData;
    }
    this.updateAssigneeDropdown();
    this.updateStats();
    this.renderTeam();
    this.renderTasks();
  }

  async saveData() {
    await chrome.storage.local.set({ taskDelegatorData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getInitials(name) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  openModal() {
    this.modal.classList.remove('hidden');
    this.memberNameEl.value = '';
    this.memberNameEl.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  async saveMember() {
    const name = this.memberNameEl.value.trim();
    if (!name) return;

    const member = {
      id: this.generateId(),
      name
    };

    this.data.members.push(member);
    await this.saveData();
    this.closeModal();
    this.updateAssigneeDropdown();
    this.renderTeam();
  }

  async removeMember(id) {
    this.data.members = this.data.members.filter(m => m.id !== id);
    await this.saveData();
    this.updateAssigneeDropdown();
    this.renderTeam();
  }

  updateAssigneeDropdown() {
    this.assigneeEl.innerHTML = '<option value="">Assign to...</option>' +
      this.data.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }

  async addTask() {
    const title = this.taskTitleEl.value.trim();
    if (!title) return;

    const task = {
      id: this.generateId(),
      title,
      assigneeId: this.assigneeEl.value || null,
      priority: this.priorityEl.value,
      status: 'pending',
      createdAt: Date.now()
    };

    this.data.tasks.unshift(task);
    await this.saveData();

    this.taskTitleEl.value = '';
    this.assigneeEl.value = '';
    this.priorityEl.value = 'low';

    this.updateStats();
    this.renderTasks();
  }

  async toggleTask(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      if (task.status === 'pending') task.status = 'in_progress';
      else if (task.status === 'in_progress') task.status = 'completed';
      else task.status = 'pending';

      await this.saveData();
      this.updateStats();
      this.renderTasks();
    }
  }

  async deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    await this.saveData();
    this.updateStats();
    this.renderTasks();
  }

  updateStats() {
    const pending = this.data.tasks.filter(t => t.status === 'pending').length;
    const inProgress = this.data.tasks.filter(t => t.status === 'in_progress').length;
    const completed = this.data.tasks.filter(t => t.status === 'completed').length;

    this.pendingCountEl.textContent = pending;
    this.inProgressCountEl.textContent = inProgress;
    this.completedCountEl.textContent = completed;
  }

  renderTeam() {
    this.teamListEl.innerHTML = this.data.members.map(m => `
      <div class="team-member" data-id="${m.id}">
        <span class="member-avatar">${this.getInitials(m.name)}</span>
        <span>${m.name}</span>
        <button class="member-remove">×</button>
      </div>
    `).join('');

    this.teamListEl.querySelectorAll('.member-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.removeMember(id);
      });
    });
  }

  renderTasks() {
    // Sort: pending first, then in_progress, then completed
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    const sortedTasks = [...this.data.tasks].sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.tasksListEl.innerHTML = sortedTasks.map(task => {
      const assignee = this.data.members.find(m => m.id === task.assigneeId);
      const isCompleted = task.status === 'completed';
      const isInProgress = task.status === 'in_progress';

      return `
        <div class="task-item ${task.priority}" data-id="${task.id}">
          <div class="task-check ${isCompleted ? 'done' : isInProgress ? 'in-progress' : ''}"></div>
          <div class="task-info">
            <div class="task-title ${isCompleted ? 'completed' : ''}">${task.title}</div>
            <div class="task-assignee">${assignee ? assignee.name : 'Unassigned'}</div>
          </div>
          <button class="task-delete">×</button>
        </div>
      `;
    }).join('');

    this.tasksListEl.querySelectorAll('.task-check').forEach(check => {
      check.addEventListener('click', () => {
        const id = check.parentElement.dataset.id;
        this.toggleTask(id);
      });
    });

    this.tasksListEl.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteTask(id);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new TaskDelegator());
