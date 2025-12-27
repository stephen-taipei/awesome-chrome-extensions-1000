// Action Items - Popup Script

class ActionItems {
  constructor() {
    this.actions = [];
    this.filter = 'all';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.actionEl = document.getElementById('action');
    this.ownerEl = document.getElementById('owner');
    this.dueDateEl = document.getElementById('dueDate');
    this.addBtn = document.getElementById('addAction');
    this.listEl = document.getElementById('actionsList');
    this.filterBtns = document.querySelectorAll('.filter-btn');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addAction());
    this.actionEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addAction();
    });
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('actionItems');
    if (result.actionItems) {
      this.actions = result.actionItems;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ actionItems: this.actions });
  }

  addAction() {
    const text = this.actionEl.value.trim();
    const owner = this.ownerEl.value.trim();
    const dueDate = this.dueDateEl.value;

    if (!text) return;

    this.actions.unshift({
      id: Date.now(),
      text,
      owner: owner || 'Unassigned',
      dueDate,
      done: false
    });

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.actionEl.value = '';
    this.ownerEl.value = '';
    this.dueDateEl.value = '';
  }

  toggleAction(id) {
    const action = this.actions.find(a => a.id === id);
    if (action) {
      action.done = !action.done;
      this.saveData();
      this.render();
    }
  }

  deleteAction(id) {
    this.actions = this.actions.filter(a => a.id !== id);
    this.saveData();
    this.render();
  }

  setFilter(filter) {
    this.filter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  getFilteredActions() {
    switch (this.filter) {
      case 'pending':
        return this.actions.filter(a => !a.done);
      case 'done':
        return this.actions.filter(a => a.done);
      default:
        return this.actions;
    }
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    return due < today;
  }

  render() {
    const filtered = this.getFilteredActions();

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No action items</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(a => {
      const overdue = !a.done && this.isOverdue(a.dueDate);
      return `
        <div class="action-item ${a.done ? 'done' : ''}">
          <div class="action-header">
            <input type="checkbox" class="action-checkbox" ${a.done ? 'checked' : ''} data-toggle="${a.id}">
            <span class="action-text">${this.escapeHtml(a.text)}</span>
          </div>
          <div class="action-details">
            <span class="action-owner">@${this.escapeHtml(a.owner)}</span>
            ${a.dueDate ? `<span class="action-due ${overdue ? 'overdue' : ''}">${this.formatDate(a.dueDate)}</span>` : ''}
            <button class="delete-btn" data-delete="${a.id}">Del</button>
          </div>
        </div>
      `;
    }).join('');

    this.listEl.querySelectorAll('[data-toggle]').forEach(cb => {
      cb.addEventListener('change', () => this.toggleAction(parseInt(cb.dataset.toggle)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteAction(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ActionItems());
