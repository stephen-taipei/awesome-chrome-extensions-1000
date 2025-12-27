// Bookmark Notes - Popup Script

class BookmarkNotes {
  constructor() {
    this.bookmarks = [];
    this.notes = {};
    this.searchQuery = '';
    this.filter = 'all';
    this.editingBookmark = null;
    this.currentRating = 0;

    this.initElements();
    this.loadData();
    this.bindEvents();
  }

  initElements() {
    this.searchInput = document.getElementById('searchInput');
    this.filterSelect = document.getElementById('filterSelect');
    this.bookmarkList = document.getElementById('bookmarkList');
    this.statsInfo = document.getElementById('statsInfo');

    this.editModal = document.getElementById('editModal');
    this.bookmarkPreview = document.getElementById('bookmarkPreview');
    this.noteInput = document.getElementById('noteInput');
    this.tagsInput = document.getElementById('tagsInput');
    this.ratingPicker = document.getElementById('ratingPicker');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.saveNoteBtn = document.getElementById('saveNoteBtn');
    this.deleteNoteBtn = document.getElementById('deleteNoteBtn');

    this.toast = document.getElementById('toast');
  }

  async loadData() {
    try {
      // Load notes
      const result = await chrome.storage.local.get(['bookmarkNotes']);
      this.notes = result.bookmarkNotes || {};

      // Load bookmarks
      const tree = await chrome.bookmarks.getTree();
      this.bookmarks = this.flattenBookmarks(tree);

      this.render();
    } catch (error) {
      console.error('Failed to load data:', error);
      this.bookmarkList.innerHTML = '<div class="empty-state">載入失敗</div>';
    }
  }

  flattenBookmarks(nodes, result = []) {
    for (const node of nodes) {
      if (node.url) {
        result.push(node);
      }
      if (node.children) {
        this.flattenBookmarks(node.children, result);
      }
    }
    return result;
  }

  async saveNotes() {
    try {
      await chrome.storage.local.set({ bookmarkNotes: this.notes });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }

  getFilteredBookmarks() {
    let filtered = [...this.bookmarks];

    // Apply filter
    if (this.filter === 'with-notes') {
      filtered = filtered.filter(b => this.notes[b.id]?.note);
    } else if (this.filter === 'rated') {
      filtered = filtered.filter(b => this.notes[b.id]?.rating > 0);
    }

    // Apply search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(b => {
        const note = this.notes[b.id];
        return b.title?.toLowerCase().includes(query) ||
               b.url?.toLowerCase().includes(query) ||
               note?.note?.toLowerCase().includes(query) ||
               note?.tags?.some(t => t.toLowerCase().includes(query));
      });
    }

    // Sort: bookmarks with notes first
    filtered.sort((a, b) => {
      const aHasNote = this.notes[a.id]?.note ? 1 : 0;
      const bHasNote = this.notes[b.id]?.note ? 1 : 0;
      return bHasNote - aHasNote;
    });

    return filtered.slice(0, 100); // Limit for performance
  }

  render() {
    const filtered = this.getFilteredBookmarks();
    const notesCount = Object.values(this.notes).filter(n => n.note).length;

    this.statsInfo.textContent = `${this.bookmarks.length} 個書籤, ${notesCount} 個筆記`;

    if (filtered.length === 0) {
      this.bookmarkList.innerHTML = `
        <div class="empty-state">
          ${this.searchQuery ? '找不到相關書籤' : '沒有書籤'}
        </div>
      `;
      return;
    }

    this.bookmarkList.innerHTML = filtered.map(bookmark => {
      const note = this.notes[bookmark.id] || {};
      const hasNote = note.note || note.rating || note.tags?.length;
      const domain = this.getDomain(bookmark.url);

      return `
        <div class="bookmark-item ${hasNote ? 'has-note' : ''}" data-id="${bookmark.id}">
          <div class="bookmark-favicon">
            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><text y=%2218%22 font-size=%2218%22>🔖</text></svg>'">
          </div>
          <div class="bookmark-info">
            <div class="bookmark-title">${this.escapeHtml(bookmark.title || 'Untitled')}</div>
            <div class="bookmark-url">${domain}</div>
            ${note.note ? `<div class="bookmark-note-preview">📝 ${this.escapeHtml(this.truncate(note.note, 40))}</div>` : ''}
            <div class="bookmark-meta">
              ${note.rating ? `<span class="bookmark-rating">${'★'.repeat(note.rating)}${'☆'.repeat(5 - note.rating)}</span>` : ''}
              ${note.tags?.length ? `<div class="bookmark-tags">${note.tags.slice(0, 2).map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  openEditModal(bookmarkId) {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;

    this.editingBookmark = bookmark;
    const note = this.notes[bookmarkId] || {};

    this.bookmarkPreview.innerHTML = `
      <div class="title">${this.escapeHtml(bookmark.title || 'Untitled')}</div>
      <div class="url">${this.escapeHtml(bookmark.url)}</div>
    `;

    this.noteInput.value = note.note || '';
    this.tagsInput.value = (note.tags || []).join(', ');
    this.currentRating = note.rating || 0;
    this.updateRatingDisplay();

    this.editModal.classList.remove('hidden');
    this.noteInput.focus();
  }

  closeEditModal() {
    this.editModal.classList.add('hidden');
    this.editingBookmark = null;
  }

  updateRatingDisplay() {
    this.ratingPicker.querySelectorAll('.star').forEach((star, index) => {
      star.textContent = index < this.currentRating ? '★' : '☆';
      star.classList.toggle('active', index < this.currentRating);
    });
  }

  async saveNote() {
    if (!this.editingBookmark) return;

    const bookmarkId = this.editingBookmark.id;
    const note = this.noteInput.value.trim();
    const tagsText = this.tagsInput.value.trim();
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t) : [];
    const rating = this.currentRating;

    if (note || tags.length || rating) {
      this.notes[bookmarkId] = { note, tags, rating };
    } else {
      delete this.notes[bookmarkId];
    }

    await this.saveNotes();
    this.closeEditModal();
    this.render();
    this.showToast('已儲存', 'success');
  }

  async deleteNote() {
    if (!this.editingBookmark) return;

    delete this.notes[this.editingBookmark.id];
    await this.saveNotes();
    this.closeEditModal();
    this.render();
    this.showToast('已刪除筆記', 'success');
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.render();
    });

    this.filterSelect.addEventListener('change', (e) => {
      this.filter = e.target.value;
      this.render();
    });

    this.bookmarkList.addEventListener('click', (e) => {
      const item = e.target.closest('.bookmark-item');
      if (item) {
        this.openEditModal(item.dataset.id);
      }
    });

    this.closeModalBtn.addEventListener('click', () => this.closeEditModal());
    this.saveNoteBtn.addEventListener('click', () => this.saveNote());
    this.deleteNoteBtn.addEventListener('click', () => this.deleteNote());

    this.ratingPicker.addEventListener('click', (e) => {
      const star = e.target.closest('.star');
      if (star) {
        this.currentRating = parseInt(star.dataset.rating);
        this.updateRatingDisplay();
      }
    });

    this.editModal.addEventListener('click', (e) => {
      if (e.target === this.editModal) {
        this.closeEditModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.editModal.classList.contains('hidden')) {
        this.closeEditModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BookmarkNotes();
});
