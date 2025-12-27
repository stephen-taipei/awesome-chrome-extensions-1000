// Contact Notes - Popup Script

class ContactNotes {
  constructor() {
    this.contacts = [];
    this.searchQuery = '';
    this.editingId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.searchEl = document.getElementById('search');
    this.nameEl = document.getElementById('name');
    this.companyEl = document.getElementById('company');
    this.notesEl = document.getElementById('notes');
    this.saveBtn = document.getElementById('saveContact');
    this.listEl = document.getElementById('contactsList');
  }

  bindEvents() {
    this.saveBtn.addEventListener('click', () => this.saveContact());
    this.searchEl.addEventListener('input', () => {
      this.searchQuery = this.searchEl.value.toLowerCase();
      this.render();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('contactNotes');
    if (result.contactNotes) {
      this.contacts = result.contactNotes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ contactNotes: this.contacts });
  }

  saveContact() {
    const name = this.nameEl.value.trim();
    const company = this.companyEl.value.trim();
    const notes = this.notesEl.value.trim();

    if (!name) return;

    if (this.editingId) {
      const contact = this.contacts.find(c => c.id === this.editingId);
      if (contact) {
        contact.name = name;
        contact.company = company;
        contact.notes = notes;
        contact.updated = new Date().toLocaleDateString();
      }
      this.editingId = null;
      this.saveBtn.textContent = 'Save Contact';
    } else {
      this.contacts.unshift({
        id: Date.now(),
        name,
        company,
        notes,
        created: new Date().toLocaleDateString()
      });

      if (this.contacts.length > 100) {
        this.contacts.pop();
      }
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.nameEl.value = '';
    this.companyEl.value = '';
    this.notesEl.value = '';
  }

  editContact(id) {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      this.nameEl.value = contact.name;
      this.companyEl.value = contact.company;
      this.notesEl.value = contact.notes;
      this.editingId = id;
      this.saveBtn.textContent = 'Update Contact';
      this.nameEl.focus();
    }
  }

  deleteContact(id) {
    this.contacts = this.contacts.filter(c => c.id !== id);
    if (this.editingId === id) {
      this.editingId = null;
      this.saveBtn.textContent = 'Save Contact';
      this.clearForm();
    }
    this.saveData();
    this.render();
  }

  getFilteredContacts() {
    if (!this.searchQuery) return this.contacts;

    return this.contacts.filter(c =>
      c.name.toLowerCase().includes(this.searchQuery) ||
      c.company.toLowerCase().includes(this.searchQuery) ||
      c.notes.toLowerCase().includes(this.searchQuery)
    );
  }

  render() {
    const filtered = this.getFilteredContacts();

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No contacts found</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(c => `
      <div class="contact-item">
        <div class="contact-header">
          <div>
            <div class="contact-name">${this.escapeHtml(c.name)}</div>
            ${c.company ? `<div class="contact-company">${this.escapeHtml(c.company)}</div>` : ''}
          </div>
        </div>
        ${c.notes ? `<div class="contact-notes">${this.escapeHtml(c.notes)}</div>` : ''}
        <div class="contact-actions">
          <button class="edit-btn" data-edit="${c.id}">Edit</button>
          <button class="delete-btn" data-delete="${c.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => this.editContact(parseInt(btn.dataset.edit)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteContact(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ContactNotes());
