// Read Later - Popup Script

class ReadLater {
  constructor() {
    this.data = {
      articles: []
    };
    this.currentFilter = 'unread';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.saveCurrentBtn = document.getElementById('saveCurrentBtn');
    this.unreadCountEl = document.getElementById('unreadCount');
    this.readCountEl = document.getElementById('readCount');
    this.totalTimeEl = document.getElementById('totalTime');
    this.searchInput = document.getElementById('searchInput');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.articlesList = document.getElementById('articlesList');
  }

  bindEvents() {
    this.saveCurrentBtn.addEventListener('click', () => this.saveCurrentPage());

    this.searchInput.addEventListener('input', () => this.renderArticles());

    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.renderArticles();
      });
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('readLaterData');
    if (result.readLaterData) {
      this.data = result.readLaterData;
    }
    this.renderArticles();
    this.updateStats();
  }

  async saveData() {
    await chrome.storage.local.set({ readLaterData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      return null;
    }
  }

  getDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  estimateReadTime(title) {
    // Rough estimate based on title length (assuming article length)
    const words = title.split(/\s+/).length;
    return Math.max(2, Math.ceil(words / 2));
  }

  async saveCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        // Check if already saved
        const exists = this.data.articles.some(a => a.url === tab.url);
        if (exists) {
          this.saveCurrentBtn.textContent = '已存在';
          setTimeout(() => {
            this.saveCurrentBtn.textContent = '+ 儲存';
          }, 1500);
          return;
        }

        const article = {
          id: this.generateId(),
          title: tab.title || 'Untitled',
          url: tab.url,
          favicon: this.getFaviconUrl(tab.url),
          domain: this.getDomain(tab.url),
          readTime: this.estimateReadTime(tab.title || ''),
          read: false,
          savedAt: Date.now()
        };

        this.data.articles.unshift(article);
        await this.saveData();

        this.saveCurrentBtn.textContent = '已儲存 ✓';
        setTimeout(() => {
          this.saveCurrentBtn.textContent = '+ 儲存';
        }, 1500);

        this.renderArticles();
        this.updateStats();
      }
    } catch (err) {
      console.error('Failed to save page:', err);
    }
  }

  async markAsRead(id) {
    const article = this.data.articles.find(a => a.id === id);
    if (article) {
      article.read = !article.read;
      article.readAt = article.read ? Date.now() : null;
      await this.saveData();
      this.renderArticles();
      this.updateStats();
    }
  }

  async openArticle(article) {
    chrome.tabs.create({ url: article.url });
  }

  async deleteArticle(id) {
    this.data.articles = this.data.articles.filter(a => a.id !== id);
    await this.saveData();
    this.renderArticles();
    this.updateStats();
  }

  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    return new Date(timestamp).toLocaleDateString('zh-TW');
  }

  updateStats() {
    const unread = this.data.articles.filter(a => !a.read).length;
    const read = this.data.articles.filter(a => a.read).length;
    const totalTime = this.data.articles
      .filter(a => !a.read)
      .reduce((sum, a) => sum + (a.readTime || 0), 0);

    this.unreadCountEl.textContent = unread;
    this.readCountEl.textContent = read;
    this.totalTimeEl.textContent = totalTime;
  }

  renderArticles() {
    const searchTerm = this.searchInput.value.toLowerCase();

    let articles = this.data.articles;

    if (this.currentFilter === 'unread') {
      articles = articles.filter(a => !a.read);
    } else if (this.currentFilter === 'read') {
      articles = articles.filter(a => a.read);
    }

    if (searchTerm) {
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(searchTerm) ||
        a.domain.toLowerCase().includes(searchTerm)
      );
    }

    this.articlesList.innerHTML = articles.map(article => `
      <div class="article-card ${article.read ? 'read' : ''}" data-id="${article.id}">
        <div class="article-header">
          <div class="article-favicon">
            ${article.favicon
              ? `<img src="${article.favicon}" alt="" onerror="this.parentElement.innerHTML='📄'">`
              : '<span>📄</span>'}
          </div>
          <div class="article-info">
            <div class="article-title">${article.title}</div>
            <div class="article-meta">
              <span class="article-domain">${article.domain}</span>
              <span class="article-time">${this.formatTime(article.savedAt)}</span>
            </div>
          </div>
        </div>
        <div class="article-actions">
          <button class="action-btn read-btn">${article.read ? '標為未讀' : '標為已讀'}</button>
          <button class="action-btn open-btn">開啟</button>
          <button class="action-btn delete-btn">×</button>
        </div>
      </div>
    `).join('');

    // Bind events
    this.articlesList.querySelectorAll('.article-card').forEach(card => {
      const id = card.dataset.id;
      const article = this.data.articles.find(a => a.id === id);

      card.querySelector('.read-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.markAsRead(id);
      });

      card.querySelector('.open-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openArticle(article);
      });

      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteArticle(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ReadLater();
});
