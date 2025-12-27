// Meeting Agenda - Popup Script

class MeetingAgenda {
  constructor() {
    this.agenda = {
      title: '',
      date: '',
      time: '',
      items: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('meetingTitle');
    this.dateEl = document.getElementById('meetingDate');
    this.timeEl = document.getElementById('meetingTime');
    this.itemEl = document.getElementById('agendaItem');
    this.durationEl = document.getElementById('duration');
    this.addBtn = document.getElementById('addItem');
    this.totalEl = document.getElementById('totalTime');
    this.listEl = document.getElementById('agendaList');
    this.copyBtn = document.getElementById('copyAgenda');
    this.clearBtn = document.getElementById('clearAgenda');
  }

  bindEvents() {
    this.titleEl.addEventListener('input', () => this.updateInfo());
    this.dateEl.addEventListener('input', () => this.updateInfo());
    this.timeEl.addEventListener('input', () => this.updateInfo());
    this.addBtn.addEventListener('click', () => this.addItem());
    this.itemEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addItem();
    });
    this.copyBtn.addEventListener('click', () => this.copyAgenda());
    this.clearBtn.addEventListener('click', () => this.clearAgenda());
  }

  async loadData() {
    const result = await chrome.storage.local.get('meetingAgenda');
    if (result.meetingAgenda) {
      this.agenda = result.meetingAgenda;
      this.titleEl.value = this.agenda.title;
      this.dateEl.value = this.agenda.date;
      this.timeEl.value = this.agenda.time;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ meetingAgenda: this.agenda });
  }

  updateInfo() {
    this.agenda.title = this.titleEl.value.trim();
    this.agenda.date = this.dateEl.value;
    this.agenda.time = this.timeEl.value;
    this.saveData();
  }

  addItem() {
    const text = this.itemEl.value.trim();
    const duration = parseInt(this.durationEl.value) || 5;

    if (!text) return;

    this.agenda.items.push({
      id: Date.now(),
      text,
      duration
    });

    this.itemEl.value = '';
    this.durationEl.value = '';
    this.saveData();
    this.render();
  }

  removeItem(id) {
    this.agenda.items = this.agenda.items.filter(item => item.id !== id);
    this.saveData();
    this.render();
  }

  clearAgenda() {
    this.agenda = { title: '', date: '', time: '', items: [] };
    this.titleEl.value = '';
    this.dateEl.value = '';
    this.timeEl.value = '';
    this.saveData();
    this.render();
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
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

  async copyAgenda() {
    const title = this.agenda.title || 'Meeting Agenda';
    let text = `${title.toUpperCase()}\n${'═'.repeat(35)}\n`;

    if (this.agenda.date) {
      text += `Date: ${this.formatDate(this.agenda.date)}`;
      if (this.agenda.time) {
        text += ` at ${this.formatTime(this.agenda.time)}`;
      }
      text += '\n';
    }

    text += `${'─'.repeat(35)}\n\n`;

    if (this.agenda.items.length === 0) {
      text += '(No agenda items)\n';
    } else {
      this.agenda.items.forEach((item, i) => {
        text += `${i + 1}. ${item.text} (${item.duration} min)\n`;
      });
    }

    const total = this.agenda.items.reduce((sum, item) => sum + item.duration, 0);
    text += `\n${'─'.repeat(35)}\nTotal: ${total} minutes\n${'═'.repeat(35)}`;

    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  render() {
    const total = this.agenda.items.reduce((sum, item) => sum + item.duration, 0);
    this.totalEl.textContent = `${total} min`;

    if (this.agenda.items.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No agenda items</div>';
      return;
    }

    this.listEl.innerHTML = this.agenda.items.map((item, i) => `
      <div class="agenda-item">
        <span class="item-number">${i + 1}.</span>
        <span class="item-text">${this.escapeHtml(item.text)}</span>
        <span class="item-duration">${item.duration}m</span>
        <button class="remove-btn" data-id="${item.id}">&times;</button>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => this.removeItem(parseInt(btn.dataset.id)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new MeetingAgenda());
