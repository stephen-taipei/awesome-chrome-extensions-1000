// Profile Links - Popup Script

class ProfileLinks {
  constructor() {
    this.links = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('linkTitle');
    this.urlEl = document.getElementById('linkUrl');
    this.iconEl = document.getElementById('linkIcon');
    this.addBtn = document.getElementById('addBtn');
    this.copyAllBtn = document.getElementById('copyAll');
    this.listEl = document.getElementById('linkList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addLink());
    this.copyAllBtn.addEventListener('click', () => this.copyAllLinks());
  }

  async loadData() {
    const result = await chrome.storage.local.get('profileLinks');
    if (result.profileLinks) {
      this.links = result.profileLinks;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ profileLinks: this.links });
  }

  addLink() {
    const title = this.titleEl.value.trim();
    const url = this.urlEl.value.trim();
    const icon = this.iconEl.value;

    if (!title || !url) return;

    const link = {
      id: Date.now(),
      title,
      url,
      icon,
      created: Date.now()
    };

    this.links.push(link);
    this.saveData();
    this.render();

    // Clear form
    this.titleEl.value = '';
    this.urlEl.value = '';

    const original = this.addBtn.textContent;
    this.addBtn.textContent = 'Added!';
    setTimeout(() => {
      this.addBtn.textContent = original;
    }, 1500);
  }

  async copyLink(id) {
    const link = this.links.find(l => l.id === id);
    if (link) {
      await navigator.clipboard.writeText(link.url);
    }
  }

  async copyAllLinks() {
    if (this.links.length === 0) return;

    const text = this.links.map(l => `${l.icon} ${l.title}: ${l.url}`).join('\n');
    await navigator.clipboard.writeText(text);

    const original = this.copyAllBtn.textContent;
    this.copyAllBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyAllBtn.textContent = original;
    }, 1500);
  }

  deleteLink(id) {
    this.links = this.links.filter(l => l.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.links.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No links added yet</div>';
      return;
    }

    this.listEl.innerHTML = this.links.map(l => `
      <div class="link-item">
        <div class="link-header">
          <span class="link-icon">${l.icon}</span>
          <span class="link-title">${this.escapeHtml(l.title)}</span>
        </div>
        <div class="link-url">${this.escapeHtml(l.url)}</div>
        <div class="link-actions">
          <button class="copy-btn" data-copy="${l.id}">Copy</button>
          <button class="delete-btn" data-delete="${l.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyLink(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteLink(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ProfileLinks());
