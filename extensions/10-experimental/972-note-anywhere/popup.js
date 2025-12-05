document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notes-list');
  const noteCount = document.getElementById('note-count');
  const totalNotes = document.getElementById('total-notes');
  const totalPages = document.getElementById('total-pages');
  const colorBtns = document.querySelectorAll('.color-btn');

  let currentUrl = '';
  let selectedColor = '#ffeb3b';

  // Get current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentUrl = tabs[0].url;
    loadNotes();
  });

  // Add note button
  document.getElementById('add-note-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'CREATE_NOTE',
        color: selectedColor
      });
      window.close();
    });
  });

  // Color selection
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });

  // Search
  document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.length >= 2) {
      chrome.runtime.sendMessage({ type: 'SEARCH_NOTES', query }, (response) => {
        if (response.success) {
          renderSearchResults(response.results);
        }
      });
    } else {
      loadNotes();
    }
  });

  function loadNotes() {
    chrome.runtime.sendMessage({ type: 'GET_NOTES', url: currentUrl }, (response) => {
      if (response && response.success) {
        renderNotes(response.notes);
      }
    });

    // Load stats
    chrome.storage.local.get(['notes'], (data) => {
      const notes = data.notes || {};
      let total = 0;
      Object.values(notes).forEach(pageNotes => total += pageNotes.length);
      totalNotes.textContent = total;
      totalPages.textContent = Object.keys(notes).length;
    });
  }

  function renderNotes(notes) {
    noteCount.textContent = notes.length;

    if (notes.length === 0) {
      notesList.innerHTML = '<div class="empty-state">No notes on this page yet</div>';
      return;
    }

    notesList.innerHTML = notes.map(note => `
      <div class="note-item" style="border-left: 4px solid ${note.color || '#ffeb3b'}">
        <div class="note-content">${escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</div>
        <div class="note-actions">
          <span class="note-time">${getTimeAgo(note.createdAt)}</span>
          <button class="delete-btn" data-id="${note.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    notesList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          type: 'DELETE_NOTE',
          url: currentUrl,
          noteId: parseInt(btn.dataset.id)
        }, () => loadNotes());
      });
    });
  }

  function renderSearchResults(results) {
    if (results.length === 0) {
      notesList.innerHTML = '<div class="empty-state">No matching notes found</div>';
      return;
    }

    notesList.innerHTML = results.map(note => `
      <div class="note-item search-result" style="border-left: 4px solid ${note.color || '#ffeb3b'}">
        <div class="note-content">${escapeHtml(note.content.substring(0, 80))}</div>
        <div class="note-url">${new URL(note.url).hostname}</div>
      </div>
    `).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getTimeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
});
