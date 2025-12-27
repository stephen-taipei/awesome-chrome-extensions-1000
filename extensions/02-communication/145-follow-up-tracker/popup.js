// Follow Up Tracker - Popup Script

class FollowUpTracker {
  constructor() {
    this.followUps = [];
    this.currentFilter = 'all';
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaultDate();
  }

  initElements() {
    this.contactEl = document.getElementById('contact');
    this.subjectEl = document.getElementById('subject');
    this.dueDateEl = document.getElementById('dueDate');
    this.addBtn = document.getElementById('addBtn');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.listEl = document.getElementById('followUpList');
    this.pendingCountEl = document.getElementById('pendingCount');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addFollowUp());
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
    });
  }

  setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dueDateEl.value = tomorrow.toISOString().split('T')[0];
  }

  async loadData() {
    const result = await chrome.storage.local.get('followUps');
    if (result.followUps) {
      this.followUps = result.followUps;
    }
    this.updateStats();
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ followUps: this.followUps });
  }

  updateStats() {
    const pending = this.followUps.filter(f => !f.done).length;
    this.pendingCountEl.textContent = `${pending} pending`;
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  addFollowUp() {
    const contact = this.contactEl.value.trim();
    const subject = this.subjectEl.value.trim();
    const dueDate = this.dueDateEl.value;

    if (!contact) return;

    const followUp = {
      id: Date.now(),
      contact,
      subject,
      dueDate,
      done: false,
      created: Date.now()
    };

    this.followUps.unshift(followUp);
    this.saveData();
    this.updateStats();
    this.render();

    // Clear form
    this.contactEl.value = '';
    this.subjectEl.value = '';
    this.setDefaultDate();

    const original = this.addBtn.textContent;
    this.addBtn.textContent = 'Added!';
    setTimeout(() => {
      this.addBtn.textContent = original;
    }, 1500);
  }

  toggleDone(id) {
    const followUp = this.followUps.find(f => f.id === id);
    if (followUp) {
      followUp.done = !followUp.done;
      this.saveData();
      this.updateStats();
      this.render();
    }
  }

  deleteFollowUp(id) {
    this.followUps = this.followUps.filter(f => f.id !== id);
    this.saveData();
    this.updateStats();
    this.render();
  }

  getStatus(followUp) {
    if (followUp.done) return 'done';
    if (!followUp.dueDate) return 'pending';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(followUp.dueDate);

    if (dueDate < today) return 'overdue';
    return 'pending';
  }

  getFilteredFollowUps() {
    return this.followUps.filter(f => {
      if (this.currentFilter === 'all') return true;
      if (this.currentFilter === 'pending') return !f.done;
      if (this.currentFilter === 'done') return f.done;
      return true;
    });
  }

  formatDate(dateStr) {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    const filtered = this.getFilteredFollowUps();

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No follow-ups</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(f => {
      const status = this.getStatus(f);
      const statusLabels = {
        pending: 'Pending',
        overdue: 'Overdue',
        done: 'Done'
      };

      return `
        <div class="follow-up-item ${f.done ? 'done' : ''}">
          <div class="follow-up-header">
            <span class="follow-up-contact">${this.escapeHtml(f.contact)}</span>
            <span class="follow-up-status status-${status}">${statusLabels[status]}</span>
          </div>
          ${f.subject ? `<div class="follow-up-subject">${this.escapeHtml(f.subject)}</div>` : ''}
          <div class="follow-up-footer">
            <span class="follow-up-date">Due: ${this.formatDate(f.dueDate)}</span>
            <div class="follow-up-actions">
              <button class="done-btn" data-done="${f.id}">${f.done ? 'Undo' : 'Done'}</button>
              <button class="delete-btn" data-delete="${f.id}">Del</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.listEl.querySelectorAll('[data-done]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleDone(parseInt(btn.dataset.done)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteFollowUp(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new FollowUpTracker());
