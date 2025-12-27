// Meeting Notes - Popup Script

class MeetingNotes {
  constructor() {
    this.meetings = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.formSection = document.getElementById('newMeetingForm');
    this.meetingsSection = document.getElementById('meetingsSection');
    this.titleEl = document.getElementById('meetingTitle');
    this.attendeesEl = document.getElementById('attendees');
    this.notesEl = document.getElementById('notes');
    this.actionItemsEl = document.getElementById('actionItems');
    this.saveBtn = document.getElementById('saveMeeting');
    this.cancelBtn = document.getElementById('cancelMeeting');
    this.newBtn = document.getElementById('newMeetingBtn');
    this.listEl = document.getElementById('meetingsList');
  }

  bindEvents() {
    this.newBtn.addEventListener('click', () => this.showForm());
    this.cancelBtn.addEventListener('click', () => this.hideForm());
    this.saveBtn.addEventListener('click', () => this.saveMeeting());
  }

  async loadData() {
    const result = await chrome.storage.local.get('meetingNotes');
    if (result.meetingNotes) {
      this.meetings = result.meetingNotes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ meetingNotes: this.meetings });
  }

  showForm() {
    this.formSection.classList.add('active');
    this.meetingsSection.style.display = 'none';
    this.titleEl.focus();
  }

  hideForm() {
    this.formSection.classList.remove('active');
    this.meetingsSection.style.display = 'block';
    this.clearForm();
  }

  clearForm() {
    this.titleEl.value = '';
    this.attendeesEl.value = '';
    this.notesEl.value = '';
    this.actionItemsEl.value = '';
  }

  saveMeeting() {
    const title = this.titleEl.value.trim();
    const attendees = this.attendeesEl.value.trim();
    const notes = this.notesEl.value.trim();
    const actionItems = this.actionItemsEl.value.trim()
      .split('\n')
      .filter(item => item.trim());

    if (!title) return;

    this.meetings.unshift({
      id: Date.now(),
      title,
      attendees: attendees ? attendees.split(',').map(a => a.trim()) : [],
      notes,
      actionItems,
      createdAt: Date.now()
    });

    this.saveData();
    this.hideForm();
    this.render();
  }

  async copyMeeting(id) {
    const meeting = this.meetings.find(m => m.id === id);
    if (!meeting) return;

    let text = `Meeting: ${meeting.title}\n`;
    text += `Date: ${this.formatDate(meeting.createdAt)}\n`;
    if (meeting.attendees.length) {
      text += `Attendees: ${meeting.attendees.join(', ')}\n`;
    }
    text += `\nNotes:\n${meeting.notes}\n`;
    if (meeting.actionItems.length) {
      text += `\nAction Items:\n${meeting.actionItems.map(a => `- ${a}`).join('\n')}`;
    }

    await navigator.clipboard.writeText(text);

    const btn = document.querySelector(`[data-copy="${id}"]`);
    if (btn) {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 1000);
    }
  }

  deleteMeeting(id) {
    this.meetings = this.meetings.filter(m => m.id !== id);
    this.saveData();
    this.render();
  }

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  render() {
    if (this.meetings.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No meetings yet. Click "+ New" to add one.</div>';
      return;
    }

    this.listEl.innerHTML = this.meetings.map(meeting => `
      <div class="meeting-item">
        <div class="meeting-header">
          <span class="meeting-title">${this.escapeHtml(meeting.title)}</span>
          <span class="meeting-date">${this.formatDate(meeting.createdAt)}</span>
        </div>
        ${meeting.attendees.length ? `<div class="meeting-attendees">${meeting.attendees.join(', ')}</div>` : ''}
        ${meeting.notes ? `<div class="meeting-notes">${this.escapeHtml(meeting.notes)}</div>` : ''}
        <div class="meeting-actions">
          <span class="action-count">${meeting.actionItems.length} action item${meeting.actionItems.length !== 1 ? 's' : ''}</span>
          <div class="meeting-btns">
            <button class="copy-btn" data-copy="${meeting.id}">Copy</button>
            <button class="delete-btn" data-delete="${meeting.id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyMeeting(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMeeting(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new MeetingNotes());
