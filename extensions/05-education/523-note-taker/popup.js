document.addEventListener('DOMContentLoaded', () => {
  const noteTitle = document.getElementById('noteTitle');
  const noteContent = document.getElementById('noteContent');
  const tagInput = document.getElementById('tagInput');
  const tagsList = document.getElementById('tagsList');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const searchInput = document.getElementById('searchInput');
  const notesList = document.getElementById('notesList');
  const noteCount = document.getElementById('noteCount');

  let currentTags = [];

  loadNotes();

  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && tagInput.value.trim()) {
      e.preventDefault();
      const tag = tagInput.value.trim().toLowerCase();
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        renderTags();
      }
      tagInput.value = '';
    }
  });

  function renderTags() {
    tagsList.innerHTML = currentTags.map(tag => `
      <span class="tag">
        ${escapeHtml(tag)}
        <span class="remove-tag" data-tag="${tag}">&times;</span>
      </span>
    `).join('');

    tagsList.querySelectorAll('.remove-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTags = currentTags.filter(t => t !== btn.dataset.tag);
        renderTags();
      });
    });
  }

  saveNoteBtn.addEventListener('click', () => {
    const content = noteContent.value.trim();
    if (!content) {
      alert('Please write some content');
      return;
    }

    chrome.storage.local.get(['notes'], (result) => {
      const notes = result.notes || [];
      notes.unshift({
        id: Date.now(),
        title: noteTitle.value.trim() || 'Untitled Note',
        content: content,
        tags: [...currentTags],
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ notes }, () => {
        noteTitle.value = '';
        noteContent.value = '';
        currentTags = [];
        tagsList.innerHTML = '';
        loadNotes();
      });
    });
  });

  searchInput.addEventListener('input', () => {
    loadNotes(searchInput.value.trim().toLowerCase());
  });

  function loadNotes(searchTerm = '') {
    chrome.storage.local.get(['notes'], (result) => {
      let notes = result.notes || [];
      noteCount.textContent = notes.length;

      if (searchTerm) {
        notes = notes.filter(n =>
          n.title.toLowerCase().includes(searchTerm) ||
          n.content.toLowerCase().includes(searchTerm) ||
          n.tags.some(t => t.includes(searchTerm))
        );
      }

      if (notes.length === 0) {
        notesList.innerHTML = '<p class="empty-message">No notes found</p>';
        return;
      }

      notesList.innerHTML = notes.slice(0, 20).map(note => `
        <div class="note-item">
          <button class="delete-btn" data-id="${note.id}">&times;</button>
          <div class="title">${escapeHtml(note.title)}</div>
          <div class="content">${escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</div>
          <div class="tags">
            ${note.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
          </div>
          <div class="meta">
            <span>${new Date(note.date).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('');

      notesList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteNote(parseInt(btn.dataset.id)));
      });
    });
  }

  function deleteNote(id) {
    chrome.storage.local.get(['notes'], (result) => {
      const notes = (result.notes || []).filter(n => n.id !== id);
      chrome.storage.local.set({ notes }, () => loadNotes(searchInput.value));
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
