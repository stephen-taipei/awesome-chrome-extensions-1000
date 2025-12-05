document.addEventListener('DOMContentLoaded', () => {
  const articlesList = document.getElementById('articlesList');
  const addPageBtn = document.getElementById('addPage');
  const tabs = document.querySelectorAll('.tab');
  const articleCountEl = document.getElementById('articleCount');

  let articles = [];
  let currentTab = 'unread';

  // Load articles
  chrome.storage.local.get(['readingList'], (result) => {
    articles = result.readingList || [];
    renderArticles();
  });

  function renderArticles() {
    const filtered = articles.filter(a =>
      currentTab === 'unread' ? !a.read : a.read
    );

    const count = filtered.length;
    articleCountEl.textContent = `${count} article${count !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      articlesList.innerHTML = `
        <div class="empty-state">
          <div class="icon">${currentTab === 'unread' ? '📚' : '✅'}</div>
          <p>${currentTab === 'unread' ? 'No articles to read' : 'No read articles yet'}</p>
        </div>
      `;
      return;
    }

    articlesList.innerHTML = filtered.map(article => `
      <div class="article-item ${article.read ? 'read' : ''}" data-id="${article.id}">
        <div class="article-header">
          <div class="article-favicon">
            <img src="https://www.google.com/s2/favicons?domain=${getDomain(article.url)}&sz=32"
                 onerror="this.parentElement.textContent='📄'">
          </div>
          <div class="article-info">
            <div class="article-title">${escapeHtml(article.title)}</div>
            <div class="article-meta">
              <span class="article-domain">${getDomain(article.url)}</span>
              <span>•</span>
              <span>${formatDate(article.addedAt)}</span>
            </div>
          </div>
        </div>
        <div class="article-actions">
          <button class="action-btn primary open-btn">Open</button>
          ${article.read
            ? '<button class="action-btn secondary unread-btn">Mark Unread</button>'
            : '<button class="action-btn done read-btn">Mark Read</button>'
          }
          <button class="action-btn secondary delete-btn">Delete</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.article-item').forEach(item => {
      const id = item.dataset.id;

      item.querySelector('.open-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openArticle(id);
      });

      const readBtn = item.querySelector('.read-btn');
      const unreadBtn = item.querySelector('.unread-btn');

      if (readBtn) {
        readBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleRead(id, true);
        });
      }

      if (unreadBtn) {
        unreadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleRead(id, false);
        });
      }

      item.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteArticle(id);
      });
    });
  }

  function addCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      // Check if already exists
      if (articles.some(a => a.url === tab.url)) {
        alert('This page is already in your reading list!');
        return;
      }

      const article = {
        id: generateId(),
        title: tab.title,
        url: tab.url,
        addedAt: Date.now(),
        read: false
      };

      articles.unshift(article);
      saveArticles();
      renderArticles();
    });
  }

  function openArticle(id) {
    const article = articles.find(a => a.id === id);
    if (article) {
      chrome.tabs.create({ url: article.url });
    }
  }

  function toggleRead(id, read) {
    const article = articles.find(a => a.id === id);
    if (article) {
      article.read = read;
      saveArticles();
      renderArticles();
    }
  }

  function deleteArticle(id) {
    articles = articles.filter(a => a.id !== id);
    saveArticles();
    renderArticles();
  }

  function saveArticles() {
    chrome.storage.local.set({ readingList: articles });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return 'Today';
    } else if (diff < 172800000) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  addPageBtn.addEventListener('click', addCurrentPage);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      renderArticles();
    });
  });
});
