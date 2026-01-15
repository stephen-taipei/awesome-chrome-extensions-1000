document.addEventListener('DOMContentLoaded', () => {
  const addCurrentBtn = document.getElementById('addCurrentBtn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sortBy = document.getElementById('sortBy');
  const readingList = document.getElementById('readingList');
  const unreadCount = document.getElementById('unreadCount');
  const readCount = document.getElementById('readCount');
  const totalCount = document.getElementById('totalCount');

  let currentTab = 'unread';

  loadList();

  addCurrentBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.storage.local.get(['readingList'], (result) => {
      const list = result.readingList || [];

      if (list.find(item => item.url === tab.url)) {
        alert('This page is already in your reading list');
        return;
      }

      list.unshift({
        id: Date.now(),
        title: tab.title,
        url: tab.url,
        read: false,
        dateAdded: new Date().toISOString()
      });

      chrome.storage.local.set({ readingList: list }, loadList);
    });
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      loadList();
    });
  });

  sortBy.addEventListener('change', loadList);

  function loadList() {
    chrome.storage.local.get(['readingList'], (result) => {
      let list = result.readingList || [];

      const unread = list.filter(item => !item.read);
      const read = list.filter(item => item.read);

      unreadCount.textContent = unread.length;
      readCount.textContent = read.length;
      totalCount.textContent = list.length;

      let displayList = currentTab === 'unread' ? unread : read;

      switch (sortBy.value) {
        case 'oldest':
          displayList.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
          break;
        case 'title':
          displayList.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          displayList.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      }

      if (displayList.length === 0) {
        readingList.innerHTML = `<p class="empty-message">No ${currentTab} items</p>`;
        return;
      }

      readingList.innerHTML = displayList.map(item => `
        <div class="reading-item ${item.read ? 'read' : ''}">
          <div class="actions">
            <button class="action-btn mark-btn" data-id="${item.id}" title="${item.read ? 'Mark as unread' : 'Mark as read'}">
              ${item.read ? '↩' : '✓'}
            </button>
            <button class="action-btn delete-btn" data-id="${item.id}" title="Delete">×</button>
          </div>
          <div class="title" data-url="${escapeHtml(item.url)}">${escapeHtml(item.title)}</div>
          <div class="url">${escapeHtml(item.url)}</div>
          <div class="meta">Added ${new Date(item.dateAdded).toLocaleDateString()}</div>
        </div>
      `).join('');

      readingList.querySelectorAll('.title').forEach(el => {
        el.addEventListener('click', () => chrome.tabs.create({ url: el.dataset.url }));
      });

      readingList.querySelectorAll('.mark-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleRead(parseInt(btn.dataset.id)));
      });

      readingList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteItem(parseInt(btn.dataset.id)));
      });
    });
  }

  function toggleRead(id) {
    chrome.storage.local.get(['readingList'], (result) => {
      const list = result.readingList || [];
      const item = list.find(i => i.id === id);
      if (item) {
        item.read = !item.read;
        chrome.storage.local.set({ readingList: list }, loadList);
      }
    });
  }

  function deleteItem(id) {
    chrome.storage.local.get(['readingList'], (result) => {
      const list = (result.readingList || []).filter(i => i.id !== id);
      chrome.storage.local.set({ readingList: list }, loadList);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
