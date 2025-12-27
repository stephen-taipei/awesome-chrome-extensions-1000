// Invitation Manager - Popup Script

class InvitationManager {
  constructor() {
    this.invites = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.nameEl = document.getElementById('eventName');
    this.dateEl = document.getElementById('eventDate');
    this.timeEl = document.getElementById('eventTime');
    this.locationEl = document.getElementById('eventLocation');
    this.detailsEl = document.getElementById('eventDetails');
    this.createBtn = document.getElementById('createInvite');
    this.listEl = document.getElementById('invitesList');
  }

  bindEvents() {
    this.createBtn.addEventListener('click', () => this.createInvitation());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedInvitations');
    if (result.savedInvitations) {
      this.invites = result.savedInvitations;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedInvitations: this.invites });
  }

  createInvitation() {
    const name = this.nameEl.value.trim();
    const date = this.dateEl.value;
    const time = this.timeEl.value;
    const location = this.locationEl.value.trim();
    const details = this.detailsEl.value.trim();

    if (!name || !date) return;

    this.invites.unshift({
      id: Date.now(),
      name,
      date,
      time,
      location,
      details
    });

    if (this.invites.length > 20) {
      this.invites.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.nameEl.value = '';
    this.dateEl.value = '';
    this.timeEl.value = '';
    this.locationEl.value = '';
    this.detailsEl.value = '';
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  formatInvitation(invite) {
    let text = `You're Invited!\n${'═'.repeat(30)}\n\n`;
    text += `${invite.name.toUpperCase()}\n\n`;
    text += `Date: ${this.formatDate(invite.date)}\n`;
    if (invite.time) {
      text += `Time: ${this.formatTime(invite.time)}\n`;
    }
    if (invite.location) {
      text += `Location: ${invite.location}\n`;
    }
    if (invite.details) {
      text += `\n${invite.details}\n`;
    }
    text += `\n${'═'.repeat(30)}`;
    return text;
  }

  async copyInvitation(id) {
    const invite = this.invites.find(i => i.id === id);
    if (invite) {
      const formatted = this.formatInvitation(invite);
      await navigator.clipboard.writeText(formatted);
      this.showCopied(id);
    }
  }

  showCopied(id) {
    const btn = this.listEl.querySelector(`[data-copy="${id}"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  }

  deleteInvitation(id) {
    this.invites = this.invites.filter(i => i.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.invites.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No invitations yet</div>';
      return;
    }

    this.listEl.innerHTML = this.invites.map(i => `
      <div class="invite-item">
        <div class="invite-name">${this.escapeHtml(i.name)}</div>
        <div class="invite-details">
          <div class="invite-row">
            <span class="invite-icon">📅</span>
            <span>${this.formatDate(i.date)}${i.time ? ' at ' + this.formatTime(i.time) : ''}</span>
          </div>
          ${i.location ? `
            <div class="invite-row">
              <span class="invite-icon">📍</span>
              <span>${this.escapeHtml(i.location)}</span>
            </div>
          ` : ''}
        </div>
        <div class="invite-actions">
          <button class="copy-btn" data-copy="${i.id}">Copy</button>
          <button class="delete-btn" data-delete="${i.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyInvitation(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteInvitation(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new InvitationManager());
