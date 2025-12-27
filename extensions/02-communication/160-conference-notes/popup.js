// Conference Notes - Popup Script

class ConferenceNotes {
  constructor() {
    this.sessions = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.conferenceEl = document.getElementById('conference');
    this.sessionEl = document.getElementById('session');
    this.speakerEl = document.getElementById('speaker');
    this.notesEl = document.getElementById('notes');
    this.copyBtn = document.getElementById('copyNotes');
    this.saveBtn = document.getElementById('saveSession');
    this.listEl = document.getElementById('sessionList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyNotes());
    this.saveBtn.addEventListener('click', () => this.saveSession());
  }

  async loadData() {
    const result = await chrome.storage.local.get('conferenceNotes');
    if (result.conferenceNotes) {
      this.sessions = result.conferenceNotes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ conferenceNotes: this.sessions });
  }

  formatNotes() {
    const conf = this.conferenceEl.value.trim() || 'Conference';
    const session = this.sessionEl.value.trim() || 'Session';
    const speaker = this.speakerEl.value.trim();
    const notes = this.notesEl.value.trim();

    let output = `📍 ${conf}\n`;
    output += '═'.repeat(30) + '\n\n';
    output += `🎤 ${session}\n`;
    if (speaker) output += `👤 ${speaker}\n`;
    output += '\n📝 Notes:\n';
    output += '─'.repeat(20) + '\n';
    output += notes || '(No notes)';
    output += '\n\n' + '═'.repeat(30);

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

  saveSession() {
    const session = this.sessionEl.value.trim();
    if (!session) return;

    const item = {
      id: Date.now(),
      conference: this.conferenceEl.value.trim(),
      session,
      speaker: this.speakerEl.value.trim(),
      notes: this.notesEl.value.trim(),
      created: Date.now()
    };

    this.sessions.unshift(item);
    if (this.sessions.length > 20) {
      this.sessions.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadSession(id) {
    const item = this.sessions.find(s => s.id === id);
    if (item) {
      this.conferenceEl.value = item.conference || '';
      this.sessionEl.value = item.session || '';
      this.speakerEl.value = item.speaker || '';
      this.notesEl.value = item.notes || '';
    }
  }

  deleteSession(id) {
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncate(text, len = 60) {
    if (!text || text.length <= len) return text || '';
    return text.substring(0, len) + '...';
  }

  render() {
    if (this.sessions.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved sessions</div>';
      return;
    }

    this.listEl.innerHTML = this.sessions.map(s => `
      <div class="session-item">
        <div class="session-header">
          <div class="session-title">${this.escapeHtml(s.session)}</div>
          ${s.conference ? `<span class="session-conf">${this.escapeHtml(this.truncate(s.conference, 15))}</span>` : ''}
        </div>
        ${s.speaker ? `<div class="session-speaker">👤 ${this.escapeHtml(s.speaker)}</div>` : ''}
        ${s.notes ? `<div class="session-notes">${this.escapeHtml(this.truncate(s.notes))}</div>` : ''}
        <div class="session-actions">
          <button class="load-btn" data-load="${s.id}">Load</button>
          <button class="delete-btn" data-delete="${s.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadSession(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSession(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ConferenceNotes());
