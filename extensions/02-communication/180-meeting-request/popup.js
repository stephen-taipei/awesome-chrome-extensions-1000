// Meeting Request - Popup Script

class MeetingRequest {
  constructor() {
    this.requests = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('meetingType');
    this.attendeeEl = document.getElementById('attendee');
    this.subjectEl = document.getElementById('subject');
    this.durationEl = document.getElementById('duration');
    this.agendaEl = document.getElementById('agenda');
    this.proposedTimesEl = document.getElementById('proposedTimes');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveRequest');
    this.listEl = document.getElementById('requestList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveRequest());
  }

  async loadData() {
    const result = await chrome.storage.local.get('meetingRequests');
    if (result.meetingRequests) {
      this.requests = result.meetingRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ meetingRequests: this.requests });
  }

  getTypeLabel(type) {
    const labels = {
      intro: 'Introduction',
      followup: 'Follow-up',
      review: 'Review',
      brainstorm: 'Brainstorm',
      interview: 'Interview',
      general: 'General'
    };
    return labels[type] || type;
  }

  formatRequest() {
    const attendee = this.attendeeEl.value.trim();
    const subject = this.subjectEl.value.trim();
    const duration = this.durationEl.value.trim();
    const agenda = this.agendaEl.value.trim();
    const proposedTimes = this.proposedTimesEl.value.trim();

    let request = `Hi${attendee ? ` ${attendee}` : ''},\n\n`;
    request += `I would like to schedule a meeting${subject ? ` regarding ${subject}` : ''}.`;

    if (duration) {
      request += ` The meeting would take approximately ${duration}.`;
    }

    request += '\n\n';

    if (agenda) {
      request += `Agenda:\n${agenda}\n\n`;
    }

    if (proposedTimes) {
      request += `I am available at the following times:\n${proposedTimes}\n\n`;
    }

    request += 'Please let me know which time works best for you, or suggest an alternative if none of these work.\n\n';
    request += 'Looking forward to connecting!\n\n';
    request += 'Best regards';

    return request;
  }

  async copyRequest() {
    const text = this.formatRequest();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveRequest() {
    const subject = this.subjectEl.value.trim();
    if (!subject) return;

    const request = {
      id: Date.now(),
      type: this.typeEl.value,
      attendee: this.attendeeEl.value.trim(),
      subject,
      duration: this.durationEl.value.trim(),
      agenda: this.agendaEl.value.trim(),
      proposedTimes: this.proposedTimesEl.value.trim(),
      created: Date.now()
    };

    this.requests.unshift(request);
    if (this.requests.length > 15) {
      this.requests.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadRequest(id) {
    const request = this.requests.find(r => r.id === id);
    if (request) {
      this.typeEl.value = request.type || 'intro';
      this.attendeeEl.value = request.attendee || '';
      this.subjectEl.value = request.subject || '';
      this.durationEl.value = request.duration || '';
      this.agendaEl.value = request.agenda || '';
      this.proposedTimesEl.value = request.proposedTimes || '';
    }
  }

  deleteRequest(id) {
    this.requests = this.requests.filter(r => r.id !== id);
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
    if (this.requests.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved requests</div>';
      return;
    }

    this.listEl.innerHTML = this.requests.map(r => `
      <div class="request-item">
        <div class="request-info">
          <div class="request-subject">${this.escapeHtml(this.truncate(r.subject))}</div>
          <div class="request-type">${this.getTypeLabel(r.type)}</div>
        </div>
        <div class="request-actions">
          <button class="load-btn" data-load="${r.id}">Load</button>
          <button class="delete-btn" data-delete="${r.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadRequest(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteRequest(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new MeetingRequest());
