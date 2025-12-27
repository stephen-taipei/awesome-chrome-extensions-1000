// Link Shortener - Popup Script

class LinkShortener {
  constructor() {
    this.links = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.longUrlEl = document.getElementById('longUrl');
    this.aliasEl = document.getElementById('alias');
    this.shortenBtn = document.getElementById('shortenBtn');
    this.getPageBtn = document.getElementById('getCurrentPage');
    this.resultSection = document.getElementById('result');
    this.resultLinkEl = document.getElementById('resultLink');
    this.copyResultBtn = document.getElementById('copyResult');
    this.listEl = document.getElementById('linksList');
  }

  bindEvents() {
    this.shortenBtn.addEventListener('click', () => this.createShortLink());
    this.getPageBtn.addEventListener('click', () => this.getCurrentPageUrl());
    this.copyResultBtn.addEventListener('click', () => this.copyResult());
  }

  async loadData() {
    const result = await chrome.storage.local.get('shortLinks');
    if (result.shortLinks) {
      this.links = result.shortLinks;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ shortLinks: this.links });
  }

  async getCurrentPageUrl() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      this.longUrlEl.value = tab.url;
    }
  }

  generateAlias() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let alias = '';
    for (let i = 0; i < 6; i++) {
      alias += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return alias;
  }

  createShortLink() {
    const longUrl = this.longUrlEl.value.trim();
    if (!longUrl) return;

    // Validate URL
    try {
      new URL(longUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    // Check if URL already exists
    const existing = this.links.find(l => l.longUrl === longUrl);
    if (existing) {
      this.showResult(existing.alias);
      return;
    }

    const alias = this.aliasEl.value.trim() || this.generateAlias();

    // Check if alias already used
    if (this.links.some(l => l.alias === alias)) {
      alert('This alias is already in use. Please choose another.');
      return;
    }

    this.links.unshift({
      id: Date.now(),
      alias,
      longUrl,
      createdAt: Date.now(),
      clicks: 0
    });

    this.saveData();
    this.showResult(alias);
    this.render();

    // Clear form
    this.longUrlEl.value = '';
    this.aliasEl.value = '';
  }

  showResult(alias) {
    this.resultLinkEl.textContent = `short/${alias}`;
    this.resultSection.style.display = 'block';
  }

  async copyResult() {
    const text = this.resultLinkEl.textContent;
    await navigator.clipboard.writeText(text);
    this.copyResultBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyResultBtn.textContent = 'Copy to Clipboard';
    }, 1500);
  }

  openLink(id) {
    const link = this.links.find(l => l.id === id);
    if (link) {
      link.clicks++;
      this.saveData();
      chrome.tabs.create({ url: link.longUrl });
    }
  }

  async copyLink(id) {
    const link = this.links.find(l => l.id === id);
    if (link) {
      await navigator.clipboard.writeText(link.longUrl);
      const btn = document.querySelector(`[data-copy="${id}"]`);
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1000);
      }
    }
  }

  deleteLink(id) {
    this.links = this.links.filter(l => l.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.links.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No links saved yet</div>';
      return;
    }

    this.listEl.innerHTML = this.links.map(link => `
      <div class="link-item">
        <div class="link-alias">short/${link.alias}</div>
        <div class="link-url">${link.longUrl}</div>
        <div class="link-actions">
          <button class="open-btn" data-open="${link.id}">Open</button>
          <button class="copy-link-btn" data-copy="${link.id}">Copy</button>
          <button class="delete-link-btn" data-delete="${link.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => this.openLink(parseInt(btn.dataset.open)));
    });

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyLink(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteLink(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new LinkShortener());
