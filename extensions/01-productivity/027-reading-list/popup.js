// Reading List - Popup Script

class ReadingList {
  constructor() {
    this.articles = [];
    this.currentFilter = 'all';
    this.searchQuery = '';

    this.initElements();
    this.loadArticles();
    this.bindEvents();
  }

  initElements() {
    this.addCurrentBtn = document.getElementById('addCurrentBtn');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.searchInput = document.getElementById('searchInput');
    this.articleList = document.getElementById('articleList');
    this.unreadCount = document.getElementById('unreadCount');
    this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
    this.toast = document.getElementById('toast');
  }

  async loadArticles() {
    try {
      const result = await chrome.storage.local.get(['readingList']);
      this.articles = result.readingList || [];
      this.render();
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  }

  async saveArticles() {
    try {
      await chrome.storage.local.set({ readingList: this.articles });
    } catch (error) {
      console.error('Failed to save articles:', error);
    }
  }

  async addCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return;

      // Check if already exists
      if (this.articles.some(a => a.url === tab.url)) {
        this.showToast('此頁面已在閱讀清單中', 'error');
        return;
      }

      // Get page metadata
      let metadata = { title: tab.title, description: '' };

      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
            const ogDesc = document.querySelector('meta[property="og:description"]')?.content;
            const desc = document.querySelector('meta[name="description"]')?.content;
            const ogImage = document.querySelector('meta[property="og:image"]')?.content;

            return {
              title: ogTitle || document.title,
              description: ogDesc || desc || '',
              image: ogImage || ''
            };
          }
        });
        metadata = result.result;
      } catch (e) {
        // Use tab info as fallback
      }

      const article = {
        id: Date.now().toString(),
        url: tab.url,
        title: metadata.title || tab.title,
        description: metadata.description,
        domain: new URL(tab.url).hostname,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}&sz=32`,
        addedAt: Date.now(),
        progress: 0,
        status: 'unread' // unread, reading, completed
      };

      this.articles.unshift(article);
      await this.saveArticles();
      this.render();
      this.showToast('已加入閱讀清單', 'success');
    } catch (error) {
      console.error('Failed to add page:', error);
      this.showToast('無法加入此頁面', 'error');
    }
  }

  async openArticle(id) {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      if (article.status === 'unread') {
        article.status = 'reading';
        await this.saveArticles();
        this.render();
      }
      chrome.tabs.create({ url: article.url });
    }
  }

  async markComplete(id) {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.status = article.status === 'completed' ? 'unread' : 'completed';
      article.progress = article.status === 'completed' ? 100 : 0;
      await this.saveArticles();
      this.render();
    }
  }

  async deleteArticle(id) {
    this.articles = this.articles.filter(a => a.id !== id);
    await this.saveArticles();
    this.render();
    this.showToast('已移除文章', 'success');
  }

  async clearCompleted() {
    const completed = this.articles.filter(a => a.status === 'completed').length;
    if (completed === 0) {
      this.showToast('沒有已完成的文章', 'error');
      return;
    }

    if (!confirm(`確定要清除 ${completed} 篇已完成的文章嗎？`)) return;

    this.articles = this.articles.filter(a => a.status !== 'completed');
    await this.saveArticles();
    this.render();
    this.showToast(`已清除 ${completed} 篇文章`, 'success');
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  getFilteredArticles() {
    let filtered = [...this.articles];

    // Filter by status
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(a => a.status === this.currentFilter);
    }

    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.domain.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  render() {
    const filtered = this.getFilteredArticles();
    const unread = this.articles.filter(a => a.status === 'unread').length;
    this.unreadCount.textContent = `${unread} 篇未讀`;

    if (filtered.length === 0) {
      this.articleList.innerHTML = `
        <div class="empty-state">
          <p>📚 ${this.searchQuery ? '找不到相關文章' : '閱讀清單是空的'}</p>
          <p>${this.searchQuery ? '嘗試其他關鍵字' : '點擊「+ 加入」儲存目前頁面'}</p>
        </div>
      `;
      return;
    }

    this.articleList.innerHTML = filtered.map(article => `
      <div class="article-item ${article.status}" data-id="${article.id}">
        <div class="article-favicon">
          <img src="${article.favicon}" onerror="this.parentElement.textContent='📄'">
        </div>
        <div class="article-info">
          <div class="article-title" title="${this.escapeHtml(article.title)}">
            ${this.escapeHtml(article.title)}
          </div>
          <div class="article-meta">
            <span class="article-domain">${article.domain}</span>
            <span class="article-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width:${article.progress}%"></div>
              </div>
            </span>
          </div>
        </div>
        <div class="article-actions">
          <button class="article-action-btn complete-btn" title="${article.status === 'completed' ? '標記未讀' : '標記已讀'}">
            ${article.status === 'completed' ? '↩️' : '✓'}
          </button>
          <button class="article-action-btn delete-btn" title="刪除">×</button>
        </div>
      </div>
    `).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    this.addCurrentBtn.addEventListener('click', () => this.addCurrentPage());

    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
    });

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.render();
    });

    this.articleList.addEventListener('click', (e) => {
      const item = e.target.closest('.article-item');
      if (!item) return;

      const id = item.dataset.id;

      if (e.target.closest('.complete-btn')) {
        this.markComplete(id);
      } else if (e.target.closest('.delete-btn')) {
        this.deleteArticle(id);
      } else {
        this.openArticle(id);
      }
    });

    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ReadingList();
});
