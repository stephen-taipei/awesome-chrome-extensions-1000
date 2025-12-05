document.addEventListener('DOMContentLoaded', () => {
  const clipboardList = document.getElementById('clipboardList');
  const searchInput = document.getElementById('searchInput');
  const clearAllBtn = document.getElementById('clearAll');
  const captureBtn = document.getElementById('captureBtn');

  let history = [];
  const MAX_HISTORY = 50;

  // Load history
  chrome.storage.local.get(['clipboardHistory'], (result) => {
    history = result.clipboardHistory || [];
    renderHistory();
  });

  function renderHistory(filter = '') {
    let items = history;

    if (filter) {
      const query = filter.toLowerCase();
      items = history.filter(item =>
        item.content.toLowerCase().includes(query)
      );
    }

    if (items.length === 0) {
      clipboardList.innerHTML = `
        <div class="empty-state">
          <div class="icon">📋</div>
          <p>${filter ? 'No matches found' : 'No clipboard history'}</p>
        </div>
      `;
      return;
    }

    clipboardList.innerHTML = items.map((item, index) => `
      <div class="clip-item" data-index="${index}">
        ${item.pinned ? '<span class="pin-indicator">📌</span>' : ''}
        <div class="clip-content">${escapeHtml(item.content)}</div>
        <div class="clip-meta">
          <span class="clip-time">${formatTime(item.timestamp)}</span>
          <div class="clip-actions">
            <button class="btn-copy">Copy</button>
            <button class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.clip-item').forEach((item, i) => {
      const index = parseInt(item.dataset.index);

      item.querySelector('.btn-copy').addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(items[index].content, item);
      });

      item.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteItem(items[index].id);
      });

      item.addEventListener('click', () => {
        copyToClipboard(items[index].content, item);
      });
    });
  }

  async function captureClipboard() {
    try {
      const text = await navigator.clipboard.readText();

      if (!text.trim()) {
        return;
      }

      // Check if already exists
      const existingIndex = history.findIndex(h => h.content === text);
      if (existingIndex !== -1) {
        // Move to top
        const [item] = history.splice(existingIndex, 1);
        item.timestamp = Date.now();
        history.unshift(item);
      } else {
        // Add new
        history.unshift({
          id: generateId(),
          content: text,
          timestamp: Date.now(),
          pinned: false
        });
      }

      // Limit history size
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }

      saveHistory();
      renderHistory(searchInput.value);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }

  function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
      element.classList.add('copied');
      setTimeout(() => {
        element.classList.remove('copied');
      }, 1000);
    });
  }

  function deleteItem(id) {
    history = history.filter(h => h.id !== id);
    saveHistory();
    renderHistory(searchInput.value);
  }

  function clearAll() {
    if (confirm('Clear all clipboard history?')) {
      history = [];
      saveHistory();
      renderHistory();
    }
  }

  function saveHistory() {
    chrome.storage.local.set({ clipboardHistory: history });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
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
  searchInput.addEventListener('input', (e) => renderHistory(e.target.value));
  clearAllBtn.addEventListener('click', clearAll);
  captureBtn.addEventListener('click', captureClipboard);

  // Auto-capture on popup open
  captureClipboard();
});
