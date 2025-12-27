// Event Invitation - Popup Script

class EventInvitation {
  constructor() {
    this.events = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('eventType');
    this.nameEl = document.getElementById('eventName');
    this.dateEl = document.getElementById('eventDate');
    this.timeEl = document.getElementById('eventTime');
    this.locationEl = document.getElementById('location');
    this.descriptionEl = document.getElementById('description');
    this.rsvpEl = document.getElementById('rsvp');
    this.copyBtn = document.getElementById('copyInvite');
    this.saveBtn = document.getElementById('saveEvent');
    this.listEl = document.getElementById('eventList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyInvite());
    this.saveBtn.addEventListener('click', () => this.saveEvent());
  }

  async loadData() {
    const result = await chrome.storage.local.get('eventInvitations');
    if (result.eventInvitations) {
      this.events = result.eventInvitations;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ eventInvitations: this.events });
  }

  getTypeEmoji(type) {
    const emojis = {
      webinar: '💻',
      conference: '🎤',
      workshop: '🛠️',
      meetup: '🤝',
      party: '🎉',
      launch: '🚀'
    };
    return emojis[type] || '📅';
  }

  formatDateTime() {
    const date = this.dateEl.value;
    const time = this.timeEl.value;
    if (!date) return '';

    const d = new Date(`${date}T${time || '00:00'}`);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: time ? 'numeric' : undefined,
      minute: time ? '2-digit' : undefined
    });
  }

  formatInvite() {
    const type = this.typeEl.value;
    const name = this.nameEl.value.trim() || 'Our Event';
    const dateTime = this.formatDateTime();
    const location = this.locationEl.value.trim();
    const description = this.descriptionEl.value.trim();
    const rsvp = this.rsvpEl.value.trim();
    const emoji = this.getTypeEmoji(type);

    let invite = `${emoji} You're Invited!\n\n`;
    invite += `📌 ${name}\n\n`;

    if (dateTime) {
      invite += `📅 ${dateTime}\n`;
    }
    if (location) {
      invite += `📍 ${location}\n`;
    }
    invite += '\n';

    if (description) {
      invite += `${description}\n\n`;
    }

    if (rsvp) {
      invite += `✉️ RSVP: ${rsvp}\n\n`;
    }

    invite += 'We hope to see you there!';

    return invite;
  }

  async copyInvite() {
    const text = this.formatInvite();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveEvent() {
    const name = this.nameEl.value.trim();
    if (!name) return;

    const event = {
      id: Date.now(),
      type: this.typeEl.value,
      name,
      date: this.dateEl.value,
      time: this.timeEl.value,
      location: this.locationEl.value.trim(),
      description: this.descriptionEl.value.trim(),
      rsvp: this.rsvpEl.value.trim(),
      created: Date.now()
    };

    this.events.unshift(event);
    if (this.events.length > 15) {
      this.events.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadEvent(id) {
    const event = this.events.find(e => e.id === id);
    if (event) {
      this.typeEl.value = event.type || 'webinar';
      this.nameEl.value = event.name || '';
      this.dateEl.value = event.date || '';
      this.timeEl.value = event.time || '';
      this.locationEl.value = event.location || '';
      this.descriptionEl.value = event.description || '';
      this.rsvpEl.value = event.rsvp || '';
    }
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatShortDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  render() {
    if (this.events.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved events</div>';
      return;
    }

    this.listEl.innerHTML = this.events.map(e => `
      <div class="event-item">
        <div class="event-info">
          <div class="event-name">${this.escapeHtml(e.name)}</div>
          <div class="event-date">${this.formatShortDate(e.date)}</div>
        </div>
        <div class="event-actions">
          <button class="load-btn" data-load="${e.id}">Load</button>
          <button class="delete-btn" data-delete="${e.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadEvent(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteEvent(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new EventInvitation());
