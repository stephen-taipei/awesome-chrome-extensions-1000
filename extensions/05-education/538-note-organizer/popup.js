document.addEventListener('DOMContentLoaded', () => {
  const folderInput = document.getElementById('folderInput');
  const addFolderBtn = document.getElementById('addFolderBtn');
  const foldersList = document.getElementById('foldersList');
  const notesSection = document.getElementById('notesSection');
  const backBtn = document.getElementById('backBtn');
  const currentFolderName = document.getElementById('currentFolderName');
  const noteTitle = document.getElementById('noteTitle');
  const noteContent = document.getElementById('noteContent');
  const addNoteBtn = document.getElementById('addNoteBtn');
  const notesList = document.getElementById('notesList');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const folderCount = document.getElementById('folderCount');
  const noteCount = document.getElementById('noteCount');

  let currentFolderId = null;

  loadFolders();

  addFolderBtn.addEventListener('click', addFolder);
  folderInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addFolder();
  });

  backBtn.addEventListener('click', () => {
    currentFolderId = null;
    notesSection.style.display = 'none';
    document.querySelector('.folders-list').parentElement.style.display = 'block';
  });

  addNoteBtn.addEventListener('click', addNote);

  searchInput.addEventListener('input', searchNotes);

  function addFolder() {
    const name = folderInput.value.trim();
    if (!name) return;

    chrome.storage.local.get(['noteFolders'], (result) => {
      const folders = result.noteFolders || [];
      folders.push({
        id: Date.now(),
        name: name,
        notes: []
      });

      chrome.storage.local.set({ noteFolders: folders }, () => {
        folderInput.value = '';
        loadFolders();
      });
    });
  }

  function loadFolders() {
    chrome.storage.local.get(['noteFolders'], (result) => {
      const folders = result.noteFolders || [];

      let totalNotes = 0;
      folders.forEach(f => totalNotes += f.notes.length);

      folderCount.textContent = folders.length;
      noteCount.textContent = totalNotes;

      if (folders.length === 0) {
        foldersList.innerHTML = '<p class="empty-message">No folders created</p>';
        return;
      }

      foldersList.innerHTML = folders.map(f => `
        <div class="folder-item" data-id="${f.id}">
          <div class="folder-info">
            <span class="folder-icon">&#128193;</span>
            <div>
              <div class="folder-name">${escapeHtml(f.name)}</div>
              <div class="note-count">${f.notes.length} notes</div>
            </div>
          </div>
          <button class="delete-btn" data-id="${f.id}">&times;</button>
        </div>
      `).join('');

      foldersList.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-btn')) return;
          openFolder(parseInt(item.dataset.id));
        });
      });

      foldersList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteFolder(parseInt(btn.dataset.id));
        });
      });
    });
  }

  function openFolder(id) {
    currentFolderId = id;

    chrome.storage.local.get(['noteFolders'], (result) => {
      const folders = result.noteFolders || [];
      const folder = folders.find(f => f.id === id);

      if (!folder) return;

      currentFolderName.textContent = folder.name;
      document.querySelector('.folders-list').parentElement.style.display = 'none';
      notesSection.style.display = 'block';

      loadNotes(folder.notes);
    });
  }

  function loadNotes(notes) {
    if (notes.length === 0) {
      notesList.innerHTML = '<p class="empty-message">No notes in this folder</p>';
      return;
    }

    notesList.innerHTML = notes.map(n => `
      <div class="note-item">
        <button class="delete-btn" data-id="${n.id}">&times;</button>
        <div class="title">${escapeHtml(n.title)}</div>
        <div class="content">${escapeHtml(n.content.substring(0, 100))}${n.content.length > 100 ? '...' : ''}</div>
      </div>
    `).join('');

    notesList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteNote(parseInt(btn.dataset.id)));
    });
  }

  function addNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
      alert('Please enter title and content');
      return;
    }

    chrome.storage.local.get(['noteFolders'], (result) => {
      const folders = result.noteFolders || [];
      const folder = folders.find(f => f.id === currentFolderId);

      if (!folder) return;

      folder.notes.unshift({
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toISOString()
      });

      chrome.storage.local.set({ noteFolders: folders }, () => {
        noteTitle.value = '';
        noteContent.value = '';
        loadNotes(folder.notes);
        loadFolders();
      });
    });
  }

  function deleteNote(noteId) {
    chrome.storage.local.get(['noteFolders'], (result) => {
      const folders = result.noteFolders || [];
      const folder = folders.find(f => f.id === currentFolderId);

      if (!folder) return;

      folder.notes = folder.notes.filter(n => n.id !== noteId);
      chrome.storage.local.set({ noteFolders: folders }, () => {
        loadNotes(folder.notes);
        loadFolders();
      });
    });
  }

  function deleteFolder(id) {
    if (!confirm('Delete this folder and all notes?')) return;

    chrome.storage.local.get(['noteFolders'], (result) => {
      const folders = (result.noteFolders || []).filter(f => f.id !== id);
      chrome.storage.local.set({ noteFolders: folders }, loadFolders);
    });
  }

  function searchNotes() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    chrome.storage.local.get(['noteFolders'], (result) => {
      const folders = result.noteFolders || [];
      const results = [];

      folders.forEach(f => {
        f.notes.forEach(n => {
          if (n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)) {
            results.push({
              folder: f.name,
              title: n.title,
              content: n.content
            });
          }
        });
      });

      if (results.length === 0) {
        searchResults.innerHTML = '<p class="empty-message">No results found</p>';
        return;
      }

      searchResults.innerHTML = results.slice(0, 5).map(r => `
        <div class="search-item">
          <div class="folder">${escapeHtml(r.folder)}</div>
          <div class="title">${escapeHtml(r.title)}</div>
        </div>
      `).join('');
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
