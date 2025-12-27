// Quick Email - Popup Script

class QuickEmail {
  constructor() {
    this.drafts = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.recipientEl = document.getElementById('recipient');
    this.subjectEl = document.getElementById('subject');
    this.bodyEl = document.getElementById('body');
    this.saveBtn = document.getElementById('saveDraft');
    this.openBtn = document.getElementById('openMail');
    this.listEl = document.getElementById('draftsList');
  }

  bindEvents() {
    this.saveBtn.addEventListener('click', () => this.saveDraft());
    this.openBtn.addEventListener('click', () => this.openInMail());
  }

  async loadData() {
    const result = await chrome.storage.local.get('emailDrafts');
    if (result.emailDrafts) {
      this.drafts = result.emailDrafts;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ emailDrafts: this.drafts });
  }

  saveDraft() {
    const recipient = this.recipientEl.value.trim();
    const subject = this.subjectEl.value.trim();
    const body = this.bodyEl.value.trim();

    if (!subject && !body) return;

    this.drafts.unshift({
      id: Date.now(),
      recipient,
      subject,
      body,
      date: new Date().toLocaleDateString()
    });

    if (this.drafts.length > 20) {
      this.drafts.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.recipientEl.value = '';
    this.subjectEl.value = '';
    this.bodyEl.value = '';
  }

  openInMail() {
    const recipient = this.recipientEl.value.trim();
    const subject = encodeURIComponent(this.subjectEl.value.trim());
    const body = encodeURIComponent(this.bodyEl.value.trim());

    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  }

  useDraft(id) {
    const draft = this.drafts.find(d => d.id === id);
    if (draft) {
      this.recipientEl.value = draft.recipient;
      this.subjectEl.value = draft.subject;
      this.bodyEl.value = draft.body;
    }
  }

  deleteDraft(id) {
    this.drafts = this.drafts.filter(d => d.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.drafts.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved drafts</div>';
      return;
    }

    this.listEl.innerHTML = this.drafts.map(d => `
      <div class="draft-item">
        <div class="draft-header">
          <span class="draft-to">${this.escapeHtml(d.recipient) || 'No recipient'}</span>
          <span class="draft-date">${d.date}</span>
        </div>
        <div class="draft-subject">${this.escapeHtml(d.subject) || 'No subject'}</div>
        <div class="draft-preview">${this.escapeHtml(d.body)}</div>
        <div class="draft-actions">
          <button class="use-btn" data-use="${d.id}">Use</button>
          <button class="delete-btn" data-delete="${d.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.useDraft(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteDraft(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new QuickEmail());
