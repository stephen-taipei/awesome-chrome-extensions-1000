// Meeting Minutes - Popup Script

class MeetingMinutes {
  constructor() {
    this.meetings = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.showDate();
  }

  initElements() {
    this.dateEl = document.getElementById('meetingDate');
    this.titleEl = document.getElementById('meetingTitle');
    this.attendeesEl = document.getElementById('attendees');
    this.discussionEl = document.getElementById('discussion');
    this.decisionsEl = document.getElementById('decisions');
    this.actionsEl = document.getElementById('actions');
    this.copyBtn = document.getElementById('copyMinutes');
    this.saveBtn = document.getElementById('saveMinutes');
    this.listEl = document.getElementById('meetingList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyMinutes());
    this.saveBtn.addEventListener('click', () => this.saveMinutes());
  }

  showDate() {
    const now = new Date();
    this.dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('meetingMinutes');
    if (result.meetingMinutes) {
      this.meetings = result.meetingMinutes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ meetingMinutes: this.meetings });
  }

  formatMinutes() {
    const title = this.titleEl.value.trim() || 'Meeting';
    const attendees = this.attendeesEl.value.trim();
    const discussion = this.discussionEl.value.trim();
    const decisions = this.decisionsEl.value.trim();
    const actions = this.actionsEl.value.trim();
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    let output = `📝 MEETING MINUTES\n`;
    output += `═`.repeat(35) + '\n\n';
    output += `📌 ${title}\n`;
    output += `📅 ${date}\n`;
    if (attendees) output += `👥 Attendees: ${attendees}\n`;
    output += '\n';

    output += `💬 DISCUSSION\n`;
    output += `─`.repeat(25) + '\n';
    output += (discussion || '(No discussion recorded)') + '\n\n';

    output += `✅ DECISIONS\n`;
    output += `─`.repeat(25) + '\n';
    output += (decisions || '(No decisions recorded)') + '\n\n';

    output += `📋 ACTION ITEMS\n`;
    output += `─`.repeat(25) + '\n';
    output += (actions || '(No action items)') + '\n\n';

    output += `═`.repeat(35);

    return output;
  }

  async copyMinutes() {
    const text = this.formatMinutes();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveMinutes() {
    const title = this.titleEl.value.trim();
    if (!title) return;

    const meeting = {
      id: Date.now(),
      title,
      attendees: this.attendeesEl.value.trim(),
      discussion: this.discussionEl.value.trim(),
      decisions: this.decisionsEl.value.trim(),
      actions: this.actionsEl.value.trim(),
      created: Date.now()
    };

    this.meetings.unshift(meeting);
    if (this.meetings.length > 15) {
      this.meetings.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadMeeting(id) {
    const meeting = this.meetings.find(m => m.id === id);
    if (meeting) {
      this.titleEl.value = meeting.title || '';
      this.attendeesEl.value = meeting.attendees || '';
      this.discussionEl.value = meeting.discussion || '';
      this.decisionsEl.value = meeting.decisions || '';
      this.actionsEl.value = meeting.actions || '';
    }
  }

  deleteMeeting(id) {
    this.meetings = this.meetings.filter(m => m.id !== id);
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
    if (this.meetings.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved meetings</div>';
      return;
    }

    this.listEl.innerHTML = this.meetings.map(m => `
      <div class="meeting-item">
        <div>
          <div class="meeting-title">${this.escapeHtml(m.title)}</div>
          <div class="meeting-date">${this.formatDate(m.created)}</div>
        </div>
        <div class="meeting-actions">
          <button class="load-btn" data-load="${m.id}">Load</button>
          <button class="delete-btn" data-delete="${m.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadMeeting(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMeeting(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new MeetingMinutes());
