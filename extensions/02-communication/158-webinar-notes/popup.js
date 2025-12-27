// Webinar Notes - Popup Script

class WebinarNotes {
  constructor() {
    this.webinars = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('webinarTitle');
    this.dateEl = document.getElementById('webinarDate');
    this.timeEl = document.getElementById('webinarTime');
    this.agendaEl = document.getElementById('agenda');
    this.offerEl = document.getElementById('offer');
    this.qaEl = document.getElementById('qa');
    this.copyBtn = document.getElementById('copyNotes');
    this.saveBtn = document.getElementById('saveWebinar');
    this.listEl = document.getElementById('webinarList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyNotes());
    this.saveBtn.addEventListener('click', () => this.saveWebinar());
  }

  async loadData() {
    const result = await chrome.storage.local.get('webinarNotes');
    if (result.webinarNotes) {
      this.webinars = result.webinarNotes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ webinarNotes: this.webinars });
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

  formatNotes() {
    const title = this.titleEl.value.trim() || 'Untitled Webinar';
    const dateTime = this.formatDateTime();
    const agenda = this.agendaEl.value.trim();
    const offer = this.offerEl.value.trim();
    const qa = this.qaEl.value.trim();

    let output = '🖥️ WEBINAR NOTES\n';
    output += '═'.repeat(30) + '\n\n';
    output += `📌 ${title}\n`;
    if (dateTime) output += `📅 ${dateTime}\n`;
    output += '\n';

    output += '📋 AGENDA / OUTLINE\n';
    output += '─'.repeat(20) + '\n';
    output += (agenda || '(No agenda)') + '\n\n';

    output += '🎁 OFFER / CTA\n';
    output += '─'.repeat(20) + '\n';
    output += (offer || '(No offer)') + '\n\n';

    output += '❓ Q&A PREP\n';
    output += '─'.repeat(20) + '\n';
    output += (qa || '(No Q&A prep)') + '\n\n';

    output += '═'.repeat(30);

    return output;
  }

  async copyNotes() {
    const text = this.formatNotes();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveWebinar() {
    const title = this.titleEl.value.trim();
    if (!title) return;

    const webinar = {
      id: Date.now(),
      title,
      date: this.dateEl.value,
      time: this.timeEl.value,
      agenda: this.agendaEl.value.trim(),
      offer: this.offerEl.value.trim(),
      qa: this.qaEl.value.trim(),
      created: Date.now()
    };

    this.webinars.unshift(webinar);
    if (this.webinars.length > 15) {
      this.webinars.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadWebinar(id) {
    const webinar = this.webinars.find(w => w.id === id);
    if (webinar) {
      this.titleEl.value = webinar.title || '';
      this.dateEl.value = webinar.date || '';
      this.timeEl.value = webinar.time || '';
      this.agendaEl.value = webinar.agenda || '';
      this.offerEl.value = webinar.offer || '';
      this.qaEl.value = webinar.qa || '';
    }
  }

  deleteWebinar(id) {
    this.webinars = this.webinars.filter(w => w.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  render() {
    if (this.webinars.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved webinars</div>';
      return;
    }

    this.listEl.innerHTML = this.webinars.map(w => `
      <div class="webinar-item">
        <div>
          <div class="webinar-title">${this.escapeHtml(w.title)}</div>
          ${w.date ? `<div class="webinar-date">${this.formatDate(w.date)}</div>` : ''}
        </div>
        <div class="webinar-actions">
          <button class="load-btn" data-load="${w.id}">Load</button>
          <button class="delete-btn" data-delete="${w.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadWebinar(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteWebinar(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new WebinarNotes());
