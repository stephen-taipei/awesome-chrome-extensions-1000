// Thank You Notes - Popup Script

const OCCASION_LABELS = {
  gift: 'Gift',
  help: 'Help',
  interview: 'Interview',
  hospitality: 'Hospitality',
  business: 'Business',
  general: 'General'
};

class ThankYouNotes {
  constructor() {
    this.notes = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.occasionEl = document.getElementById('occasion');
    this.recipientEl = document.getElementById('recipient');
    this.messageEl = document.getElementById('message');
    this.saveBtn = document.getElementById('saveNote');
    this.listEl = document.getElementById('notesList');
  }

  bindEvents() {
    this.saveBtn.addEventListener('click', () => this.saveNote());
  }

  async loadData() {
    const result = await chrome.storage.local.get('thankYouNotes');
    if (result.thankYouNotes) {
      this.notes = result.thankYouNotes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ thankYouNotes: this.notes });
  }

  saveNote() {
    const occasion = this.occasionEl.value;
    const recipient = this.recipientEl.value.trim();
    const message = this.messageEl.value.trim();

    if (!recipient || !message) return;

    this.notes.unshift({
      id: Date.now(),
      occasion,
      recipient,
      message,
      date: new Date().toLocaleDateString()
    });

    if (this.notes.length > 30) {
      this.notes.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.recipientEl.value = '';
    this.messageEl.value = '';
    this.occasionEl.value = 'gift';
  }

  formatNote(note) {
    return `Dear ${note.recipient},\n\n${note.message}\n\nWith gratitude,\n[Your Name]`;
  }

  async copyNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      const formatted = this.formatNote(note);
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

  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.notes.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved notes</div>';
      return;
    }

    this.listEl.innerHTML = this.notes.map(n => `
      <div class="note-item">
        <div class="note-header">
          <span class="note-recipient">To: ${this.escapeHtml(n.recipient)}</span>
          <span class="note-occasion">${OCCASION_LABELS[n.occasion]}</span>
        </div>
        <div class="note-message">${this.escapeHtml(n.message)}</div>
        <div class="note-actions">
          <button class="copy-btn" data-copy="${n.id}">Copy</button>
          <button class="delete-btn" data-delete="${n.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyNote(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteNote(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ThankYouNotes());
