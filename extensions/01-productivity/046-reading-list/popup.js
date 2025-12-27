// Reading List - Popup Script

class ReadingList {
  constructor() {
    this.articles = [];
    this.currentTab = 'unread';
    this.initElements();
    this.bindEvents();
    this.loadArticles();
  }

  initElements() {
    this.addCurrentBtn = document.getElementById('addCurrentBtn');
    this.tabs = document.querySelectorAll('.tab');
    this.unreadList = document.getElementById('unreadList');
    this.readList = document.getElementById('readList');
    this.unreadCount = document.getElementById('unreadCount');
    this.readCount = document.getElementById('readCount');
    this.emptyState = document.getElementById('emptyState');
    this.clearReadBtn = document.getElementById('clearReadBtn');

    // Create toast element
    this.toast = document.createElement('div');
    this.toast.className = 'toast';
    document.body.appendChild(this.toast);
  }

  bindEvents() {
    this.addCurrentBtn.addEventListener('click', () => this.addCurrentPage());

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentTab = tab.dataset.tab;
        this.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderArticles();
      });
    });

    this.clearReadBtn.addEventListener('click', () => this.clearRead());
  }

  async loadArticles() {
    const result = await chrome.storage.local.get(['readingList']);
    this.articles = result.readingList || [];
    this.renderArticles();
    this.updateCounts();
  }

  async saveArticles() {
    await chrome.storage.local.set({ readingList: this.articles });
    this.updateCounts();
    this.updateBadge();
  }

  async addCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Check if already exists
      if (this.articles.some(a => a.url === tab.url)) {
        this.showToast('文章已在列表中');
        return;
      }

      const article = {
        id: Date.now().toString(),
        title: tab.title || '無標題',
        url: tab.url,
        favicon: tab.favIconUrl || '',
        domain: new URL(tab.url).hostname.replace('www.', ''),
        addedAt: new Date().toISOString(),
        read: false
      };

      this.articles.unshift(article);
      await this.saveArticles();
      this.renderArticles();
      this.showToast('已加入閱讀清單');
    } catch (error) {
      this.showToast('無法加入此頁面');
    }
  }

  async toggleRead(articleId) {
    const article = this.articles.find(a => a.id === articleId);
    if (article) {
      article.read = !article.read;
      await this.saveArticles();
      this.renderArticles();
    }
  }

  async deleteArticle(articleId) {
    this.articles = this.articles.filter(a => a.id !== articleId);
    await this.saveArticles();
    this.renderArticles();
    this.showToast('已刪除');
  }

  async clearRead() {
    this.articles = this.articles.filter(a => !a.read);
    await this.saveArticles();
    this.renderArticles();
    this.showToast('已清除已讀文章');
  }

  openArticle(url) {
    chrome.tabs.create({ url });
  }

  updateCounts() {
    const unread = this.articles.filter(a => !a.read).length;
    const read = this.articles.filter(a => a.read).length;

    this.unreadCount.textContent = unread;
    this.readCount.textContent = read;
    this.clearReadBtn.disabled = read === 0;
  }

  updateBadge() {
    const unreadCount = this.articles.filter(a => !a.read).length;
    chrome.runtime.sendMessage({
      type: 'updateBadge',
      count: unreadCount
    });
  }

  formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '剛剛';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分鐘前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小時前`;
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  renderArticles() {
    const unreadArticles = this.articles.filter(a => !a.read);
    const readArticles = this.articles.filter(a => a.read);

    // Toggle lists visibility
    this.unreadList.classList.toggle('hidden', this.currentTab !== 'unread');
    this.readList.classList.toggle('hidden', this.currentTab !== 'read');

    // Render unread list
    this.unreadList.innerHTML = '';
    unreadArticles.forEach(article => {
      this.unreadList.appendChild(this.createArticleItem(article));
    });

    // Render read list
    this.readList.innerHTML = '';
    readArticles.forEach(article => {
      this.readList.appendChild(this.createArticleItem(article));
    });

    // Show/hide empty state
    const currentList = this.currentTab === 'unread' ? unreadArticles : readArticles;
    this.emptyState.classList.toggle('hidden', currentList.length > 0);

    if (currentList.length === 0) {
      this.emptyState.querySelector('.empty-icon').textContent =
        this.currentTab === 'unread' ? '📖' : '✅';
      this.emptyState.querySelector('div:nth-child(2)').textContent =
        this.currentTab === 'unread' ? '沒有待讀文章' : '沒有已讀文章';
      this.emptyState.querySelector('.empty-hint').textContent =
        this.currentTab === 'unread' ? '點擊 + 加入目前頁面' : '閱讀完畢會顯示在這裡';
    }
  }

  createArticleItem(article) {
    const item = document.createElement('div');
    item.className = `article-item ${article.read ? 'read' : ''}`;

    item.innerHTML = `
      <div class="article-favicon">
        ${article.favicon ?
          `<img src="${article.favicon}" onerror="this.parentElement.textContent='📄'">` :
          '📄'}
      </div>
      <div class="article-info">
        <div class="article-title">${this.escapeHtml(article.title)}</div>
        <div class="article-meta">
          <span class="article-domain">${this.escapeHtml(article.domain)}</span>
          <span>•</span>
          <span>${this.formatDate(article.addedAt)}</span>
        </div>
      </div>
      <div class="article-actions">
        <button class="action-btn check" data-id="${article.id}" title="${article.read ? '標為未讀' : '標為已讀'}">
          ${article.read ? '↩️' : '✓'}
        </button>
        <button class="action-btn delete" data-id="${article.id}" title="刪除">
          ✕
        </button>
      </div>
    `;

    // Click to open
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.article-actions')) {
        this.openArticle(article.url);
      }
    });

    // Toggle read
    const checkBtn = item.querySelector('.check');
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleRead(article.id);
    });

    // Delete
    const deleteBtn = item.querySelector('.delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteArticle(article.id);
    });

    return item;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.add('show');

    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ReadingList();
});
