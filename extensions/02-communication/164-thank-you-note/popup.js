// Thank You Note - Popup Script

class ThankYouNote {
  constructor() {
    this.notes = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.occasionEl = document.getElementById('occasion');
    this.recipientEl = document.getElementById('recipient');
    this.reasonEl = document.getElementById('reason');
    this.impactEl = document.getElementById('impact');
    this.senderEl = document.getElementById('sender');
    this.copyBtn = document.getElementById('copyNote');
    this.saveBtn = document.getElementById('saveNote');
    this.listEl = document.getElementById('noteList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyNote());
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

  getOccasionLabel(occasion) {
    const labels = {
      interview: 'Interview',
      gift: 'Gift',
      help: 'Help',
      referral: 'Referral',
      meeting: 'Meeting',
      hospitality: 'Hospitality',
      general: 'General'
    };
    return labels[occasion] || occasion;
  }

  formatNote() {
    const recipient = this.recipientEl.value.trim();
    const reason = this.reasonEl.value.trim();
    const impact = this.impactEl.value.trim();
    const sender = this.senderEl.value.trim();

    let note = recipient ? `Dear ${recipient},\n\n` : 'Hi,\n\n';
    note += 'I wanted to take a moment to express my sincere gratitude';

    if (reason) {
      note += ` for ${reason}`;
    }
    note += '.\n\n';

    if (impact) {
      note += `${impact}\n\n`;
    }

    note += 'Your kindness and generosity truly mean a lot to me. Thank you so much!\n\n';
    note += 'With appreciation,\n';
    note += sender || '[Your name]';

    return note;
  }

  async copyNote() {
    const text = this.formatNote();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveNote() {
    const recipient = this.recipientEl.value.trim();
    if (!recipient) return;

    const note = {
      id: Date.now(),
      occasion: this.occasionEl.value,
      recipient,
      reason: this.reasonEl.value.trim(),
      impact: this.impactEl.value.trim(),
      sender: this.senderEl.value.trim(),
      created: Date.now()
    };

    this.notes.unshift(note);
    if (this.notes.length > 15) {
      this.notes.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      this.occasionEl.value = note.occasion || 'general';
      this.recipientEl.value = note.recipient || '';
      this.reasonEl.value = note.reason || '';
      this.impactEl.value = note.impact || '';
      this.senderEl.value = note.sender || '';
    }
  }

  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.notes.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved notes</div>';
      return;
    }

    this.listEl.innerHTML = this.notes.map(n => `
      <div class="note-item">
        <div class="note-info">
          <div class="note-recipient">${this.escapeHtml(n.recipient)}</div>
          <div class="note-occasion">${this.getOccasionLabel(n.occasion)}</div>
        </div>
        <div class="note-actions">
          <button class="load-btn" data-load="${n.id}">Load</button>
          <button class="delete-btn" data-delete="${n.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadNote(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteNote(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ThankYouNote());
