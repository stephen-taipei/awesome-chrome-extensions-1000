// Client Manager - Popup Script

const statusIcons = {
  active: '🟢',
  prospect: '🟡',
  inactive: '🔴'
};

class ClientManager {
  constructor() {
    this.data = {
      clients: []
    };
    this.editingId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.searchInputEl = document.getElementById('searchInput');
    this.clientCountEl = document.getElementById('clientCount');
    this.addClientBtn = document.getElementById('addClientBtn');
    this.clientsListEl = document.getElementById('clientsList');
    this.modal = document.getElementById('modal');
    this.modalTitleEl = document.getElementById('modalTitle');
    this.clientNameEl = document.getElementById('clientName');
    this.contactNameEl = document.getElementById('contactName');
    this.emailEl = document.getElementById('email');
    this.phoneEl = document.getElementById('phone');
    this.statusEl = document.getElementById('status');
    this.notesEl = document.getElementById('notes');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.searchInputEl.addEventListener('input', () => this.renderClients());
    this.addClientBtn.addEventListener('click', () => this.openModal());
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.saveBtn.addEventListener('click', () => this.saveClient());
  }

  async loadData() {
    const result = await chrome.storage.local.get('clientManagerData');
    if (result.clientManagerData) {
      this.data = result.clientManagerData;
    }
    this.updateCount();
    this.renderClients();
  }

  async saveData() {
    await chrome.storage.local.set({ clientManagerData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getInitials(name) {
    return name.split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  openModal(client = null) {
    this.editingId = client?.id || null;
    this.modalTitleEl.textContent = client ? 'Edit Client' : 'Add Client';

    this.clientNameEl.value = client?.name || '';
    this.contactNameEl.value = client?.contactName || '';
    this.emailEl.value = client?.email || '';
    this.phoneEl.value = client?.phone || '';
    this.statusEl.value = client?.status || 'active';
    this.notesEl.value = client?.notes || '';

    this.modal.classList.remove('hidden');
    this.clientNameEl.focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.editingId = null;
  }

  async saveClient() {
    const name = this.clientNameEl.value.trim();
    if (!name) {
      this.clientNameEl.style.borderColor = '#ef4444';
      setTimeout(() => {
        this.clientNameEl.style.borderColor = '';
      }, 1500);
      return;
    }

    const clientData = {
      name,
      contactName: this.contactNameEl.value.trim(),
      email: this.emailEl.value.trim(),
      phone: this.phoneEl.value.trim(),
      status: this.statusEl.value,
      notes: this.notesEl.value.trim()
    };

    if (this.editingId) {
      const idx = this.data.clients.findIndex(c => c.id === this.editingId);
      if (idx !== -1) {
        this.data.clients[idx] = { ...this.data.clients[idx], ...clientData, updatedAt: Date.now() };
      }
    } else {
      const client = {
        id: this.generateId(),
        ...clientData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.data.clients.unshift(client);
    }

    await this.saveData();
    this.closeModal();
    this.updateCount();
    this.renderClients();
  }

  async deleteClient(id) {
    this.data.clients = this.data.clients.filter(c => c.id !== id);
    await this.saveData();
    this.updateCount();
    this.renderClients();
  }

  updateCount() {
    const count = this.data.clients.length;
    this.clientCountEl.textContent = `${count} client${count !== 1 ? 's' : ''}`;
  }

  renderClients() {
    const search = this.searchInputEl.value.toLowerCase();
    let clients = this.data.clients;

    if (search) {
      clients = clients.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.contactName?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search)
      );
    }

    // Sort: active first, then prospect, then inactive
    const statusOrder = { active: 0, prospect: 1, inactive: 2 };
    clients.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    this.clientsListEl.innerHTML = clients.map(client => `
      <div class="client-item" data-id="${client.id}">
        <div class="client-avatar">${this.getInitials(client.name)}</div>
        <div class="client-info">
          <div class="client-name">${client.name}</div>
          <div class="client-contact">${client.contactName || client.email || 'No contact info'}</div>
        </div>
        <span class="client-status">${statusIcons[client.status]}</span>
        <div class="client-actions">
          <button class="action-btn edit">✏️</button>
          <button class="action-btn delete">🗑️</button>
        </div>
      </div>
    `).join('');

    this.clientsListEl.querySelectorAll('.client-item').forEach(item => {
      const id = item.dataset.id;
      const client = this.data.clients.find(c => c.id === id);

      item.querySelector('.edit').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal(client);
      });

      item.querySelector('.delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteClient(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ClientManager();
});
