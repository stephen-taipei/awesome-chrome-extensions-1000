document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notesList');
  const noteEditor = document.getElementById('noteEditor');
  const addNoteBtn = document.getElementById('addNote');
  const saveNoteBtn = document.getElementById('saveNote');
  const cancelNoteBtn = document.getElementById('cancelNote');
  const noteTitleInput = document.getElementById('noteTitle');
  const noteContentInput = document.getElementById('noteContent');
  const searchInput = document.getElementById('searchInput');

  let notes = [];
  let editingNoteId = null;

  // Load notes from storage
  chrome.storage.local.get(['notes'], (result) => {
    notes = result.notes || [];
    renderNotes();
  });

  function renderNotes(filter = '') {
    const filteredNotes = notes.filter(note =>
      note.title.toLowerCase().includes(filter.toLowerCase()) ||
      note.content.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredNotes.length === 0) {
      notesList.innerHTML = `
        <div class="empty-state">
          <p>${filter ? 'No notes found' : 'No notes yet. Click + to add one!'}</p>
        </div>
      `;
      return;
    }

    notesList.innerHTML = filteredNotes.map(note => `
      <div class="note-card" data-id="${note.id}">
        <button class="delete-btn" data-id="${note.id}" title="Delete">×</button>
        <h3>${escapeHtml(note.title)}</h3>
        <p>${escapeHtml(note.content)}</p>
        <div class="note-date">${formatDate(note.updatedAt)}</div>
      </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
          e.stopPropagation();
          deleteNote(e.target.dataset.id);
        } else {
          editNote(card.dataset.id);
        }
      });
    });
  }

  function showEditor(note = null) {
    notesList.classList.add('hidden');
    noteEditor.classList.remove('hidden');

    if (note) {
      editingNoteId = note.id;
      noteTitleInput.value = note.title;
      noteContentInput.value = note.content;
    } else {
      editingNoteId = null;
      noteTitleInput.value = '';
      noteContentInput.value = '';
    }

    noteTitleInput.focus();
  }

  function hideEditor() {
    noteEditor.classList.add('hidden');
    notesList.classList.remove('hidden');
    editingNoteId = null;
  }

  function saveNote() {
    const title = noteTitleInput.value.trim() || 'Untitled';
    const content = noteContentInput.value.trim();

    if (!content) {
      noteContentInput.focus();
      return;
    }

    const now = Date.now();

    if (editingNoteId) {
      const index = notes.findIndex(n => n.id === editingNoteId);
      if (index !== -1) {
        notes[index] = { ...notes[index], title, content, updatedAt: now };
      }
    } else {
      notes.unshift({
        id: generateId(),
        title,
        content,
        createdAt: now,
        updatedAt: now
      });
    }

    chrome.storage.local.set({ notes }, () => {
      hideEditor();
      renderNotes();
    });
  }

  function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
      showEditor(note);
    }
  }

  function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    chrome.storage.local.set({ notes }, () => {
      renderNotes(searchInput.value);
    });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  addNoteBtn.addEventListener('click', () => showEditor());
  saveNoteBtn.addEventListener('click', saveNote);
  cancelNoteBtn.addEventListener('click', hideEditor);
  searchInput.addEventListener('input', (e) => renderNotes(e.target.value));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !noteEditor.classList.contains('hidden')) {
      hideEditor();
    }
    if (e.ctrlKey && e.key === 'Enter' && !noteEditor.classList.contains('hidden')) {
      saveNote();
    }
  });
});
