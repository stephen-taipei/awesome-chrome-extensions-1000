// Deadline Tracker - Popup Script

class DeadlineTracker {
  constructor() {
    this.deadlines = [];
    this.editingId = null;
    this.initElements();
    this.bindEvents();
    this.loadDeadlines();
  }

  initElements() {
    // Sections
    this.urgentSection = document.getElementById('urgentSection');
    this.upcomingSection = document.getElementById('upcomingSection');
    this.laterSection = document.getElementById('laterSection');
    this.completedSection = document.getElementById('completedSection');

    // Lists
    this.urgentList = document.getElementById('urgentList');
    this.upcomingList = document.getElementById('upcomingList');
    this.laterList = document.getElementById('laterList');
    this.completedList = document.getElementById('completedList');

    // Counts
    this.urgentCount = document.getElementById('urgentCount');
    this.upcomingCount = document.getElementById('upcomingCount');
    this.laterCount = document.getElementById('laterCount');

    // Buttons
    this.addBtn = document.getElementById('addBtn');
    this.clearCompletedBtn = document.getElementById('clearCompletedBtn');

    // Modal
    this.modal = document.getElementById('addModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.saveDeadlineBtn = document.getElementById('saveDeadlineBtn');
    this.deleteDeadlineBtn = document.getElementById('deleteDeadlineBtn');

    // Form fields
    this.deadlineTitle = document.getElementById('deadlineTitle');
    this.deadlineDate = document.getElementById('deadlineDate');
    this.deadlineCategory = document.getElementById('deadlineCategory');
    this.deadlineNotes = document.getElementById('deadlineNotes');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    this.deadlineDate.min = today;
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.openAddModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.saveDeadlineBtn.addEventListener('click', () => this.saveDeadline());
    this.deleteDeadlineBtn.addEventListener('click', () => this.deleteDeadline());
    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

    // Enter key to save
    this.deadlineTitle.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveDeadline();
    });
  }

  async loadDeadlines() {
    const result = await chrome.storage.local.get(['deadlines']);
    this.deadlines = result.deadlines || [];
    this.renderDeadlines();
    this.updateBadge();
  }

  async saveToStorage() {
    await chrome.storage.local.set({ deadlines: this.deadlines });
    this.updateBadge();
  }

  openAddModal() {
    this.editingId = null;
    this.modalTitle.textContent = '新增截止日期';
    this.deleteDeadlineBtn.classList.add('hidden');
    this.clearForm();

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.deadlineDate.value = tomorrow.toISOString().split('T')[0];

    this.modal.classList.remove('hidden');
    this.deadlineTitle.focus();
  }

  openEditModal(deadline) {
    this.editingId = deadline.id;
    this.modalTitle.textContent = '編輯截止日期';
    this.deleteDeadlineBtn.classList.remove('hidden');

    this.deadlineTitle.value = deadline.title;
    this.deadlineDate.value = deadline.date;
    this.deadlineCategory.value = deadline.category;
    this.deadlineNotes.value = deadline.notes || '';

    this.modal.classList.remove('hidden');
    this.deadlineTitle.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.clearForm();
  }

  clearForm() {
    this.deadlineTitle.value = '';
    this.deadlineDate.value = '';
    this.deadlineCategory.value = 'work';
    this.deadlineNotes.value = '';
  }

  async saveDeadline() {
    const title = this.deadlineTitle.value.trim();
    const date = this.deadlineDate.value;

    if (!title || !date) {
      this.deadlineTitle.focus();
      return;
    }

    if (this.editingId) {
      // Update existing
      const index = this.deadlines.findIndex(d => d.id === this.editingId);
      if (index !== -1) {
        this.deadlines[index] = {
          ...this.deadlines[index],
          title,
          date,
          category: this.deadlineCategory.value,
          notes: this.deadlineNotes.value.trim()
        };

        // Update alarms
        await this.setReminders(this.deadlines[index]);
      }
    } else {
      // Add new
      const deadline = {
        id: Date.now().toString(),
        title,
        date,
        category: this.deadlineCategory.value,
        notes: this.deadlineNotes.value.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      this.deadlines.push(deadline);

      // Set reminder alarms
      await this.setReminders(deadline);
    }

    await this.saveToStorage();
    this.renderDeadlines();
    this.closeModal();
  }

  async setReminders(deadline) {
    const deadlineDate = new Date(deadline.date);
    deadlineDate.setHours(9, 0, 0, 0); // Remind at 9 AM

    const reminderDays = [7, 3, 1]; // 7 days, 3 days, 1 day before

    for (const days of reminderDays) {
      const reminderTime = new Date(deadlineDate);
      reminderTime.setDate(reminderTime.getDate() - days);

      if (reminderTime > new Date()) {
        chrome.alarms.create(`deadline-${deadline.id}-${days}`, {
          when: reminderTime.getTime()
        });
      }
    }
  }

  async deleteDeadline() {
    if (!this.editingId) return;

    // Clear alarms
    chrome.alarms.clear(`deadline-${this.editingId}-7`);
    chrome.alarms.clear(`deadline-${this.editingId}-3`);
    chrome.alarms.clear(`deadline-${this.editingId}-1`);

    this.deadlines = this.deadlines.filter(d => d.id !== this.editingId);
    await this.saveToStorage();
    this.renderDeadlines();
    this.closeModal();
  }

  async toggleComplete(id) {
    const deadline = this.deadlines.find(d => d.id === id);
    if (deadline) {
      deadline.completed = !deadline.completed;

      if (deadline.completed) {
        // Clear alarms when completed
        chrome.alarms.clear(`deadline-${id}-7`);
        chrome.alarms.clear(`deadline-${id}-3`);
        chrome.alarms.clear(`deadline-${id}-1`);
      } else {
        // Re-set alarms when uncompleted
        await this.setReminders(deadline);
      }

      await this.saveToStorage();
      this.renderDeadlines();
    }
  }

  async clearCompleted() {
    this.deadlines = this.deadlines.filter(d => !d.completed);
    await this.saveToStorage();
    this.renderDeadlines();
  }

  getDaysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    deadline.setHours(0, 0, 0, 0);
    const diff = deadline - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getUrgencyClass(days) {
    if (days < 0) return 'urgent'; // Overdue
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'safe';
  }

  getCategoryEmoji(category) {
    const emojis = {
      work: '💼',
      personal: '🏠',
      study: '📚',
      project: '📁',
      other: '📌'
    };
    return emojis[category] || '📌';
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  }

  renderDeadlines() {
    // Clear lists
    this.urgentList.innerHTML = '';
    this.upcomingList.innerHTML = '';
    this.laterList.innerHTML = '';
    this.completedList.innerHTML = '';

    // Separate and sort deadlines
    const active = this.deadlines
      .filter(d => !d.completed)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const completed = this.deadlines.filter(d => d.completed);

    const urgent = [];
    const upcoming = [];
    const later = [];

    active.forEach(deadline => {
      const days = this.getDaysUntil(deadline.date);
      if (days <= 3) {
        urgent.push({ ...deadline, days });
      } else if (days <= 7) {
        upcoming.push({ ...deadline, days });
      } else {
        later.push({ ...deadline, days });
      }
    });

    // Render each section
    urgent.forEach(d => {
      this.urgentList.appendChild(this.createDeadlineItem(d));
    });

    upcoming.forEach(d => {
      this.upcomingList.appendChild(this.createDeadlineItem(d));
    });

    later.forEach(d => {
      this.laterList.appendChild(this.createDeadlineItem(d));
    });

    completed.forEach(d => {
      this.completedList.appendChild(this.createDeadlineItem(d, true));
    });

    // Update counts
    this.urgentCount.textContent = urgent.length;
    this.upcomingCount.textContent = upcoming.length;
    this.laterCount.textContent = later.length;

    // Toggle section visibility
    this.urgentSection.classList.toggle('hidden', urgent.length === 0);
    this.upcomingSection.classList.toggle('hidden', upcoming.length === 0 && urgent.length > 0);
    this.laterSection.classList.toggle('hidden', later.length === 0);
    this.completedSection.classList.toggle('hidden', completed.length === 0);

    // Show empty state if no deadlines
    if (active.length === 0 && completed.length === 0) {
      this.upcomingSection.classList.remove('hidden');
      this.upcomingList.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 36px; margin-bottom: 8px;">📅</div>
          <div>沒有截止日期</div>
          <div style="font-size: 12px; margin-top: 4px;">點擊 + 新增一個</div>
        </div>
      `;
    }
  }

  createDeadlineItem(deadline, isCompleted = false) {
    const item = document.createElement('div');
    const days = deadline.days !== undefined ? deadline.days : this.getDaysUntil(deadline.date);
    const urgencyClass = isCompleted ? 'completed' : this.getUrgencyClass(days);

    item.className = `deadline-item ${urgencyClass}`;

    let daysText;
    let unitText;

    if (isCompleted) {
      daysText = '✓';
      unitText = '';
    } else if (days < 0) {
      daysText = Math.abs(days);
      unitText = '天前到期';
    } else if (days === 0) {
      daysText = '今天';
      unitText = '';
    } else if (days === 1) {
      daysText = '明天';
      unitText = '';
    } else {
      daysText = days;
      unitText = '天';
    }

    item.innerHTML = `
      <button class="deadline-check" data-id="${deadline.id}">
        ${isCompleted ? '✓' : ''}
      </button>
      <div class="deadline-info">
        <div class="deadline-title">${this.escapeHtml(deadline.title)}</div>
        <div class="deadline-meta">
          <span>${this.getCategoryEmoji(deadline.category)}</span>
          <span>${this.formatDate(deadline.date)}</span>
        </div>
      </div>
      <div class="deadline-countdown">
        <div class="deadline-days">${daysText}</div>
        ${unitText ? `<div class="deadline-unit">${unitText}</div>` : ''}
      </div>
    `;

    // Check button click
    const checkBtn = item.querySelector('.deadline-check');
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleComplete(deadline.id);
    });

    // Item click to edit
    item.addEventListener('click', () => {
      if (!isCompleted) {
        this.openEditModal(deadline);
      }
    });

    return item;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateBadge() {
    const urgentCount = this.deadlines.filter(d => {
      if (d.completed) return false;
      const days = this.getDaysUntil(d.date);
      return days <= 3;
    }).length;

    chrome.runtime.sendMessage({
      type: 'updateBadge',
      count: urgentCount
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new DeadlineTracker();
});
