// Team Announcement - Popup Script

class TeamAnnouncement {
  constructor() {
    this.announcements = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('announcementType');
    this.subjectEl = document.getElementById('subject');
    this.messageEl = document.getElementById('message');
    this.detailsEl = document.getElementById('details');
    this.actionEl = document.getElementById('action');
    this.copyBtn = document.getElementById('copyAnnouncement');
    this.saveBtn = document.getElementById('saveAnnouncement');
    this.listEl = document.getElementById('announcementList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyAnnouncement());
    this.saveBtn.addEventListener('click', () => this.saveAnnouncement());
  }

  async loadData() {
    const result = await chrome.storage.local.get('teamAnnouncements');
    if (result.teamAnnouncements) {
      this.announcements = result.teamAnnouncements;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ teamAnnouncements: this.announcements });
  }

  getTypeLabel(type) {
    const labels = {
      update: 'Update',
      celebration: 'Celebration',
      policy: 'Policy',
      event: 'Event',
      reminder: 'Reminder',
      welcome: 'Welcome'
    };
    return labels[type] || type;
  }

  getTypeEmoji(type) {
    const emojis = {
      update: '📢',
      celebration: '🎉',
      policy: '📋',
      event: '📅',
      reminder: '⏰',
      welcome: '👋'
    };
    return emojis[type] || '📣';
  }

  formatAnnouncement() {
    const type = this.typeEl.value;
    const subject = this.subjectEl.value.trim();
    const message = this.messageEl.value.trim();
    const details = this.detailsEl.value.trim();
    const action = this.actionEl.value.trim();

    let announcement = `${this.getTypeEmoji(type)} Team Announcement: ${subject || 'Important Update'}\n\n`;
    announcement += 'Hi Team,\n\n';

    if (message) {
      announcement += `${message}\n\n`;
    }

    if (details) {
      announcement += `Additional Details:\n${details}\n\n`;
    }

    if (action) {
      announcement += `📌 Action Required: ${action}\n\n`;
    }

    announcement += 'Please feel free to reach out if you have any questions.\n\n';
    announcement += 'Best,\n[Your Name]';

    return announcement;
  }

  async copyAnnouncement() {
    const text = this.formatAnnouncement();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveAnnouncement() {
    const subject = this.subjectEl.value.trim();
    if (!subject) return;

    const announcement = {
      id: Date.now(),
      type: this.typeEl.value,
      subject,
      message: this.messageEl.value.trim(),
      details: this.detailsEl.value.trim(),
      action: this.actionEl.value.trim(),
      created: Date.now()
    };

    this.announcements.unshift(announcement);
    if (this.announcements.length > 15) {
      this.announcements.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadAnnouncement(id) {
    const announcement = this.announcements.find(a => a.id === id);
    if (announcement) {
      this.typeEl.value = announcement.type || 'update';
      this.subjectEl.value = announcement.subject || '';
      this.messageEl.value = announcement.message || '';
      this.detailsEl.value = announcement.details || '';
      this.actionEl.value = announcement.action || '';
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

  truncate(text, len = 25) {
    if (!text || text.length <= len) return text || '';
    return text.substring(0, len) + '...';
  }

  render() {
    if (this.announcements.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved announcements</div>';
      return;
    }

    this.listEl.innerHTML = this.announcements.map(a => `
      <div class="announcement-item">
        <div class="announcement-info">
          <div class="announcement-subject">${this.escapeHtml(this.truncate(a.subject))}</div>
          <div class="announcement-type">${this.getTypeLabel(a.type)}</div>
        </div>
        <div class="announcement-actions">
          <button class="load-btn" data-load="${a.id}">Load</button>
          <button class="delete-btn" data-delete="${a.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadAnnouncement(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteAnnouncement(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new TeamAnnouncement());
