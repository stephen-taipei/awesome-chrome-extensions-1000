document.addEventListener('DOMContentLoaded', () => {
  const bookmarksList = document.getElementById('bookmarksList');
  const searchInput = document.getElementById('searchInput');
  const addBookmarkBtn = document.getElementById('addBookmark');
  const folderBtns = document.querySelectorAll('.folder-btn');
  const bookmarkCountEl = document.getElementById('bookmarkCount');
  const foldersNav = document.getElementById('foldersNav');

  let allBookmarks = [];
  let currentFolder = 'all';
  let currentPath = [];

  // Load bookmarks
  loadBookmarks();

  function loadBookmarks() {
    chrome.bookmarks.getTree((tree) => {
      allBookmarks = [];
      flattenBookmarks(tree);
      updateFolderNav(tree);
      renderBookmarks();
    });
  }

  function flattenBookmarks(nodes, depth = 0) {
    for (const node of nodes) {
      if (node.url) {
        allBookmarks.push({
          id: node.id,
          title: node.title || 'Untitled',
          url: node.url,
          dateAdded: node.dateAdded,
          parentId: node.parentId
        });
      }
      if (node.children) {
        flattenBookmarks(node.children, depth + 1);
      }
    }
  }

  function updateFolderNav(tree) {
    const folders = [];
    extractFolders(tree, folders);

    // Keep default buttons, add folder buttons
    const defaultBtns = foldersNav.querySelectorAll('.folder-btn[data-folder="all"], .folder-btn[data-folder="recent"]');
    foldersNav.innerHTML = '';
    defaultBtns.forEach(btn => foldersNav.appendChild(btn));

    folders.slice(0, 5).forEach(folder => {
      const btn = document.createElement('button');
      btn.className = 'folder-btn';
      btn.dataset.folder = folder.id;
      btn.textContent = folder.title;
      btn.addEventListener('click', () => selectFolder(folder.id));
      foldersNav.appendChild(btn);
    });
  }

  function extractFolders(nodes, folders) {
    for (const node of nodes) {
      if (!node.url && node.title && node.id !== '0') {
        folders.push({ id: node.id, title: node.title });
      }
      if (node.children) {
        extractFolders(node.children, folders);
      }
    }
  }

  function selectFolder(folderId) {
    currentFolder = folderId;
    document.querySelectorAll('.folder-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.folder === folderId);
    });
    renderBookmarks();
  }

  function renderBookmarks(filter = '') {
    let bookmarks = [...allBookmarks];

    // Filter by folder
    if (currentFolder === 'recent') {
      bookmarks.sort((a, b) => b.dateAdded - a.dateAdded);
      bookmarks = bookmarks.slice(0, 20);
    } else if (currentFolder !== 'all') {
      bookmarks = bookmarks.filter(b => b.parentId === currentFolder);
    }

    // Filter by search
    if (filter) {
      const query = filter.toLowerCase();
      bookmarks = bookmarks.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query)
      );
    }

    // Update count
    bookmarkCountEl.textContent = `${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}`;

    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = `
        <div class="empty-state">
          <p>${filter ? 'No bookmarks found' : 'No bookmarks yet'}</p>
        </div>
      `;
      return;
    }

    bookmarksList.innerHTML = bookmarks.map(bookmark => `
      <div class="bookmark-item" data-id="${bookmark.id}" data-url="${escapeHtml(bookmark.url)}">
        <div class="bookmark-favicon">
          <img src="https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32"
               onerror="this.style.display='none';this.parentElement.textContent='🔗'">
        </div>
        <div class="bookmark-info">
          <div class="bookmark-title">${escapeHtml(bookmark.title)}</div>
          <div class="bookmark-url">${escapeHtml(bookmark.url)}</div>
        </div>
        <div class="bookmark-actions">
          <button class="action-btn copy" title="Copy URL">📋</button>
          <button class="action-btn delete" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.bookmark-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('action-btn')) {
          e.stopPropagation();
          if (e.target.classList.contains('delete')) {
            deleteBookmark(item.dataset.id);
          } else if (e.target.classList.contains('copy')) {
            copyToClipboard(item.dataset.url);
          }
        } else {
          chrome.tabs.create({ url: item.dataset.url });
        }
      });
    });
  }

  function deleteBookmark(id) {
    chrome.bookmarks.remove(id, () => {
      allBookmarks = allBookmarks.filter(b => b.id !== id);
      renderBookmarks(searchInput.value);
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  function addCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.bookmarks.create({
        title: tab.title,
        url: tab.url
      }, () => {
        loadBookmarks();
      });
    });
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  searchInput.addEventListener('input', (e) => renderBookmarks(e.target.value));
  addBookmarkBtn.addEventListener('click', addCurrentPage);

  folderBtns.forEach(btn => {
    btn.addEventListener('click', () => selectFolder(btn.dataset.folder));
  });
});
