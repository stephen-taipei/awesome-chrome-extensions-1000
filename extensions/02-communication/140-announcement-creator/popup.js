// Announcement Creator - Popup Script

class AnnouncementCreator {
  constructor() {
    this.announcements = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('title');
    this.priorityEl = document.getElementById('priority');
    this.contentEl = document.getElementById('content');
    this.createBtn = document.getElementById('createBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.listEl = document.getElementById('announcementList');
  }

  bindEvents() {
    this.createBtn.addEventListener('click', () => this.createAnnouncement());
    this.clearBtn.addEventListener('click', () => this.clearForm());
  }

  async loadData() {
    const result = await chrome.storage.local.get('announcements');
    if (result.announcements) {
      this.announcements = result.announcements;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ announcements: this.announcements });
  }

  getPriorityIcon(priority) {
    const icons = {
      normal: '📋',
      important: '⚠️',
      urgent: '🚨'
    };
    return icons[priority] || '📋';
  }

  formatAnnouncement(announcement) {
    const icon = this.getPriorityIcon(announcement.priority);
    const priorityLabel = announcement.priority.toUpperCase();
    const date = new Date(announcement.created).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let text = `${icon} ANNOUNCEMENT ${announcement.priority !== 'normal' ? `[${priorityLabel}]` : ''}\n`;
    text += `${'─'.repeat(30)}\n\n`;
    text += `📌 ${announcement.title}\n\n`;
    text += `${announcement.content}\n\n`;
    text += `${'─'.repeat(30)}\n`;
    text += `Posted: ${date}`;

    return text;
  }

  async createAnnouncement() {
    const title = this.titleEl.value.trim();
    const content = this.contentEl.value.trim();
    const priority = this.priorityEl.value;

    if (!title || !content) return;

    const announcement = {
      id: Date.now(),
      title,
      content,
      priority,
      created: Date.now()
    };

    // Copy to clipboard
    const formatted = this.formatAnnouncement(announcement);
    await navigator.clipboard.writeText(formatted);

    // Save
    this.announcements.unshift(announcement);
    if (this.announcements.length > 15) {
      this.announcements.pop();
    }

    this.saveData();
    this.clearForm();
    this.render();

    const original = this.createBtn.textContent;
    this.createBtn.textContent = 'Created & Copied!';
    setTimeout(() => {
      this.createBtn.textContent = original;
    }, 1500);
  }

  clearForm() {
    this.titleEl.value = '';
    this.contentEl.value = '';
    this.priorityEl.value = 'normal';
  }

  async copyAnnouncement(id) {
    const announcement = this.announcements.find(a => a.id === id);
    if (announcement) {
      const formatted = this.formatAnnouncement(announcement);
      await navigator.clipboard.writeText(formatted);
    }
  }

  deleteAnnouncement(id) {
    this.announcements = this.announcements.filter(a => a.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  render() {
    if (this.announcements.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No announcements yet</div>';
      return;
    }

    this.listEl.innerHTML = this.announcements.map(a => `
      <div class="announcement-item">
        <div class="announcement-header">
          <span class="announcement-title">${this.escapeHtml(a.title)}</span>
          <span class="priority-badge priority-${a.priority}">${a.priority}</span>
        </div>
        <div class="announcement-preview">${this.escapeHtml(a.content)}</div>
        <div class="announcement-footer">
          <span class="announcement-date">${this.formatDate(a.created)}</span>
          <div class="announcement-actions">
            <button class="copy-btn-sm" data-copy="${a.id}">Copy</button>
            <button class="delete-btn" data-delete="${a.id}">Del</button>
          </div>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyAnnouncement(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteAnnouncement(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new AnnouncementCreator());
