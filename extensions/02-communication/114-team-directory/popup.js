// Team Directory - Popup Script

class TeamDirectory {
  constructor() {
    this.members = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.searchEl = document.getElementById('search');
    this.addBtn = document.getElementById('addBtn');
    this.addForm = document.getElementById('addForm');
    this.nameEl = document.getElementById('name');
    this.roleEl = document.getElementById('role');
    this.emailEl = document.getElementById('email');
    this.phoneEl = document.getElementById('phone');
    this.deptEl = document.getElementById('department');
    this.saveBtn = document.getElementById('saveBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.listEl = document.getElementById('teamList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.showForm());
    this.cancelBtn.addEventListener('click', () => this.hideForm());
    this.saveBtn.addEventListener('click', () => this.saveMember());
    this.searchEl.addEventListener('input', () => this.render());
  }

  async loadData() {
    const result = await chrome.storage.local.get('teamDirectory');
    if (result.teamDirectory) {
      this.members = result.teamDirectory;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ teamDirectory: this.members });
  }

  showForm() {
    this.addForm.style.display = 'flex';
    this.nameEl.focus();
  }

  hideForm() {
    this.addForm.style.display = 'none';
    this.clearForm();
  }

  clearForm() {
    this.nameEl.value = '';
    this.roleEl.value = '';
    this.emailEl.value = '';
    this.phoneEl.value = '';
    this.deptEl.value = '';
  }

  saveMember() {
    const name = this.nameEl.value.trim();
    if (!name) return;

    this.members.unshift({
      id: Date.now(),
      name,
      role: this.roleEl.value.trim(),
      email: this.emailEl.value.trim(),
      phone: this.phoneEl.value.trim(),
      department: this.deptEl.value
    });

    this.saveData();
    this.hideForm();
    this.render();
  }

  deleteMember(id) {
    this.members = this.members.filter(m => m.id !== id);
    this.saveData();
    this.render();
  }

  getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getFilteredMembers() {
    const query = this.searchEl.value.toLowerCase().trim();
    if (!query) return this.members;

    return this.members.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      m.department.toLowerCase().includes(query)
    );
  }

  render() {
    const filtered = this.getFilteredMembers();

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No team members found</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(member => `
      <div class="member-card">
        <div class="member-header">
          <div class="member-avatar">${this.getInitials(member.name)}</div>
          <div class="member-info">
            <div class="member-name">${this.escapeHtml(member.name)}</div>
            ${member.role ? `<div class="member-role">${this.escapeHtml(member.role)}</div>` : ''}
          </div>
          ${member.department ? `<span class="member-dept">${member.department}</span>` : ''}
        </div>
        <div class="member-contact">
          ${member.email ? `<a href="mailto:${member.email}" class="contact-btn">📧 Email</a>` : ''}
          ${member.phone ? `<a href="tel:${member.phone}" class="contact-btn">📱 Call</a>` : ''}
        </div>
        <div class="member-actions">
          <button class="delete-btn" data-delete="${member.id}">Remove</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMember(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new TeamDirectory());
