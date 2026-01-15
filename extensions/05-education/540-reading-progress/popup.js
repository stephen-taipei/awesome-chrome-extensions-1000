document.addEventListener('DOMContentLoaded', () => {
  const totalArticles = document.getElementById('totalArticles');
  const completedArticles = document.getElementById('completedArticles');
  const totalPages = document.getElementById('totalPages');
  const addCurrentBtn = document.getElementById('addCurrentBtn');
  const bookTitle = document.getElementById('bookTitle');
  const currentPage = document.getElementById('currentPage');
  const totalPageCount = document.getElementById('totalPageCount');
  const addBookBtn = document.getElementById('addBookBtn');
  const progressList = document.getElementById('progressList');
  const completedList = document.getElementById('completedList');

  loadProgress();

  addCurrentBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.storage.local.get(['readingProgress'], (result) => {
      const progress = result.readingProgress || { items: [], completed: [] };

      if (progress.items.find(i => i.url === tab.url)) {
        alert('This page is already being tracked');
        return;
      }

      progress.items.push({
        id: Date.now(),
        type: 'article',
        title: tab.title,
        url: tab.url,
        currentPage: 0,
        totalPages: 1,
        dateAdded: new Date().toISOString()
      });

      chrome.storage.local.set({ readingProgress: progress }, loadProgress);
    });
  });

  addBookBtn.addEventListener('click', () => {
    const title = bookTitle.value.trim();
    const current = parseInt(currentPage.value) || 0;
    const total = parseInt(totalPageCount.value);

    if (!title || !total) {
      alert('Please enter title and total pages');
      return;
    }

    chrome.storage.local.get(['readingProgress'], (result) => {
      const progress = result.readingProgress || { items: [], completed: [] };

      progress.items.push({
        id: Date.now(),
        type: 'book',
        title: title,
        currentPage: current,
        totalPages: total,
        dateAdded: new Date().toISOString()
      });

      chrome.storage.local.set({ readingProgress: progress }, () => {
        bookTitle.value = '';
        currentPage.value = '';
        totalPageCount.value = '';
        loadProgress();
      });
    });
  });

  function loadProgress() {
    chrome.storage.local.get(['readingProgress'], (result) => {
      const progress = result.readingProgress || { items: [], completed: [] };

      const items = progress.items;
      const completed = progress.completed;

      totalArticles.textContent = items.length;
      completedArticles.textContent = completed.length;

      const pagesRead = items.reduce((sum, i) => sum + i.currentPage, 0) +
        completed.reduce((sum, i) => sum + i.totalPages, 0);
      totalPages.textContent = pagesRead;

      renderProgressItems(items);
      renderCompletedItems(completed);
    });
  }

  function renderProgressItems(items) {
    if (items.length === 0) {
      progressList.innerHTML = '<p class="empty-message">No items being tracked</p>';
      return;
    }

    progressList.innerHTML = items.map(item => {
      const percent = item.totalPages > 0 ? Math.round((item.currentPage / item.totalPages) * 100) : 0;
      return `
        <div class="progress-item">
          <div class="actions">
            <button class="action-btn update-btn" data-id="${item.id}">+</button>
            <button class="action-btn delete-btn" data-id="${item.id}">&times;</button>
          </div>
          <div class="title">${escapeHtml(item.title)}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
          <div class="meta">
            <span>${item.currentPage} / ${item.totalPages} ${item.type === 'book' ? 'pages' : ''}</span>
            <span class="percent">${percent}%</span>
          </div>
        </div>
      `;
    }).join('');

    progressList.querySelectorAll('.update-btn').forEach(btn => {
      btn.addEventListener('click', () => updateProgress(parseInt(btn.dataset.id)));
    });

    progressList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteItem(parseInt(btn.dataset.id)));
    });
  }

  function renderCompletedItems(items) {
    if (items.length === 0) {
      completedList.innerHTML = '<p class="empty-message">No completed items</p>';
      return;
    }

    completedList.innerHTML = items.slice(0, 5).map(item => `
      <div class="completed-item">
        <span class="title">${escapeHtml(item.title)}</span>
        <span class="date">${new Date(item.completedDate).toLocaleDateString()}</span>
      </div>
    `).join('');
  }

  function updateProgress(id) {
    chrome.storage.local.get(['readingProgress'], (result) => {
      const progress = result.readingProgress || { items: [], completed: [] };
      const item = progress.items.find(i => i.id === id);

      if (!item) return;

      const newPage = prompt(`Update progress for "${item.title}"\nCurrent: ${item.currentPage}/${item.totalPages}`, item.currentPage + 1);

      if (newPage === null) return;

      const pageNum = parseInt(newPage);
      if (isNaN(pageNum) || pageNum < 0) return;

      item.currentPage = Math.min(pageNum, item.totalPages);

      if (item.currentPage >= item.totalPages) {
        if (confirm('Mark as completed?')) {
          progress.items = progress.items.filter(i => i.id !== id);
          progress.completed.unshift({
            ...item,
            completedDate: new Date().toISOString()
          });
        }
      }

      chrome.storage.local.set({ readingProgress: progress }, loadProgress);
    });
  }

  function deleteItem(id) {
    chrome.storage.local.get(['readingProgress'], (result) => {
      const progress = result.readingProgress || { items: [], completed: [] };
      progress.items = progress.items.filter(i => i.id !== id);
      chrome.storage.local.set({ readingProgress: progress }, loadProgress);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
