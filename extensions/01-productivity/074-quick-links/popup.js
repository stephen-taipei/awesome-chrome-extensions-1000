// Quick Links - Popup Script

const categoryEmojis = {
  work: '💼',
  social: '💬',
  tools: '🔧',
  other: '📌'
};

class QuickLinks {
  constructor() {
    this.data = {
      links: []
    };
    this.currentFilter = 'all';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.addCurrentBtn = document.getElementById('addCurrentBtn');
    this.searchInput = document.getElementById('searchInput');
    this.catTabs = document.querySelectorAll('.cat-tab');
    this.linksGrid = document.getElementById('linksGrid');
    this.addForm = document.getElementById('addForm');
    this.closeFormBtn = document.getElementById('closeFormBtn');
    this.linkName = document.getElementById('linkName');
    this.linkUrl = document.getElementById('linkUrl');
    this.linkCategory = document.getElementById('linkCategory');
    this.saveBtn = document.getElementById('saveBtn');
  }

  bindEvents() {
    this.addCurrentBtn.addEventListener('click', () => this.addCurrentPage());

    this.searchInput.addEventListener('input', () => this.renderLinks());

    this.catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.category;
        this.renderLinks();
      });
    });

    this.closeFormBtn.addEventListener('click', () => this.hideForm());

    this.saveBtn.addEventListener('click', () => this.saveLink());
  }

  async loadData() {
    const result = await chrome.storage.local.get('quickLinksData');
    if (result.quickLinksData) {
      this.data = result.quickLinksData;
    }
    this.renderLinks();
  }

  async saveData() {
    await chrome.storage.local.set({ quickLinksData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        this.linkName.value = tab.title || '';
        this.linkUrl.value = tab.url || '';
        this.showForm();
      }
    } catch (err) {
      console.error('Failed to get current tab:', err);
      this.showForm();
    }
  }

  showForm() {
    this.addForm.classList.remove('hidden');
  }

  hideForm() {
    this.addForm.classList.add('hidden');
    this.linkName.value = '';
    this.linkUrl.value = '';
  }

  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      return null;
    }
  }

  async saveLink() {
    const name = this.linkName.value.trim();
    const url = this.linkUrl.value.trim();
    const category = this.linkCategory.value;

    if (!name || !url) {
      this.saveBtn.textContent = '請填寫必填欄位';
      setTimeout(() => {
        this.saveBtn.textContent = '儲存';
      }, 1500);
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      this.saveBtn.textContent = '無效的網址';
      setTimeout(() => {
        this.saveBtn.textContent = '儲存';
      }, 1500);
      return;
    }

    const link = {
      id: this.generateId(),
      name,
      url,
      category,
      favicon: this.getFaviconUrl(url),
      createdAt: Date.now(),
      clickCount: 0
    };

    this.data.links.unshift(link);
    await this.saveData();

    this.hideForm();
    this.renderLinks();
  }

  async openLink(link) {
    // Update click count
    const l = this.data.links.find(item => item.id === link.id);
    if (l) {
      l.clickCount = (l.clickCount || 0) + 1;
      await this.saveData();
    }

    // Open in new tab
    chrome.tabs.create({ url: link.url });
  }

  async deleteLink(id) {
    this.data.links = this.data.links.filter(l => l.id !== id);
    await this.saveData();
    this.renderLinks();
  }

  renderLinks() {
    const searchTerm = this.searchInput.value.toLowerCase();

    let links = this.data.links;

    if (this.currentFilter !== 'all') {
      links = links.filter(l => l.category === this.currentFilter);
    }

    if (searchTerm) {
      links = links.filter(l =>
        l.name.toLowerCase().includes(searchTerm) ||
        l.url.toLowerCase().includes(searchTerm)
      );
    }

    this.linksGrid.innerHTML = links.map(link => `
      <div class="link-card" data-id="${link.id}">
        <div class="link-icon">
          ${link.favicon
            ? `<img src="${link.favicon}" alt="" onerror="this.style.display='none'">`
            : categoryEmojis[link.category]}
        </div>
        <span class="link-name">${link.name}</span>
        <button class="link-delete" title="刪除">×</button>
      </div>
    `).join('');

    // Bind events
    this.linksGrid.querySelectorAll('.link-card').forEach(card => {
      const id = card.dataset.id;
      const link = this.data.links.find(l => l.id === id);

      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('link-delete')) {
          this.openLink(link);
        }
      });

      card.querySelector('.link-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteLink(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new QuickLinks();
});
