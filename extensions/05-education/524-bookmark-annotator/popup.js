document.addEventListener('DOMContentLoaded', () => {
  const pageInfo = document.getElementById('pageInfo');
  const annotationText = document.getElementById('annotationText');
  const categorySelect = document.getElementById('categorySelect');
  const saveBtn = document.getElementById('saveBtn');
  const filterCategory = document.getElementById('filterCategory');
  const bookmarksList = document.getElementById('bookmarksList');

  let currentTab = null;

  init();

  async function init() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    pageInfo.innerHTML = `
      <div class="page-title">${escapeHtml(tab.title)}</div>
      <div class="page-url">${escapeHtml(tab.url)}</div>
    `;

    chrome.storage.local.get(['annotations'], (result) => {
      const annotations = result.annotations || [];
      const existing = annotations.find(a => a.url === tab.url);
      if (existing) {
        annotationText.value = existing.annotation;
        categorySelect.value = existing.category;
      }
    });

    loadBookmarks();
  }

  saveBtn.addEventListener('click', () => {
    const annotation = annotationText.value.trim();
    const category = categorySelect.value;

    if (!annotation) {
      alert('Please add an annotation');
      return;
    }

    chrome.storage.local.get(['annotations'], (result) => {
      let annotations = result.annotations || [];

      const existingIndex = annotations.findIndex(a => a.url === currentTab.url);

      const bookmarkData = {
        id: Date.now(),
        url: currentTab.url,
        title: currentTab.title,
        annotation: annotation,
        category: category,
        date: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        annotations[existingIndex] = { ...annotations[existingIndex], ...bookmarkData };
      } else {
        annotations.unshift(bookmarkData);
      }

      chrome.storage.local.set({ annotations }, loadBookmarks);
    });
  });

  filterCategory.addEventListener('change', loadBookmarks);

  function loadBookmarks() {
    chrome.storage.local.get(['annotations'], (result) => {
      let annotations = result.annotations || [];
      const filter = filterCategory.value;

      if (filter) {
        annotations = annotations.filter(a => a.category === filter);
      }

      if (annotations.length === 0) {
        bookmarksList.innerHTML = '<p class="empty-message">No annotated bookmarks</p>';
        return;
      }

      bookmarksList.innerHTML = annotations.map(a => `
        <div class="bookmark-item">
          <button class="delete-btn" data-id="${a.id}">&times;</button>
          <div class="title">${escapeHtml(a.title)}</div>
          <div class="annotation">${escapeHtml(a.annotation.substring(0, 80))}${a.annotation.length > 80 ? '...' : ''}</div>
          <div class="meta">
            ${a.category ? `<span class="category">${a.category}</span>` : '<span></span>'}
            <button class="open-btn" data-url="${escapeHtml(a.url)}">Open</button>
          </div>
        </div>
      `).join('');

      bookmarksList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteBookmark(parseInt(btn.dataset.id)));
      });

      bookmarksList.querySelectorAll('.open-btn').forEach(btn => {
        btn.addEventListener('click', () => chrome.tabs.create({ url: btn.dataset.url }));
      });
    });
  }

  function deleteBookmark(id) {
    chrome.storage.local.get(['annotations'], (result) => {
      const annotations = (result.annotations || []).filter(a => a.id !== id);
      chrome.storage.local.set({ annotations }, loadBookmarks);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
