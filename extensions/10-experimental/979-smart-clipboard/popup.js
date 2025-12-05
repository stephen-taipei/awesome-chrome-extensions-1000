document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const historyList = document.getElementById('history-list');
  const itemCount = document.getElementById('item-count');

  // Load clipboard history
  function loadHistory() {
    chrome.storage.local.get(['clipboardHistory'], (data) => {
      const history = data.clipboardHistory || [];
      renderHistory(history);
      itemCount.textContent = history.length;
    });
  }

  function renderHistory(history) {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No clipboard history yet</div>';
      return;
    }

    historyList.innerHTML = history.slice(0, 20).map(item => `
      <div class="history-item" data-type="${item.type}" data-id="${item.id}">
        <span class="item-type">${getTypeIcon(item.type)}</span>
        <span class="item-content">${escapeHtml(item.content.substring(0, 50))}${item.content.length > 50 ? '...' : ''}</span>
        <span class="item-time">${getTimeAgo(item.timestamp)}</span>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const entry = history.find(h => h.id === parseInt(id));
        if (entry) {
          navigator.clipboard.writeText(entry.content);
          item.style.background = 'rgba(46, 204, 113, 0.3)';
          setTimeout(() => item.style.background = '', 500);
        }
      });
    });
  }

  function getTypeIcon(type) {
    const icons = {
      text: '📝',
      url: '🔗',
      email: '📧',
      phone: '📞',
      json: '{}',
      html: '🌐',
      code: '💻'
    };
    return icons[type] || '📝';
  }

  function getTimeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`${btn.dataset.tab}-tab`).classList.remove('hidden');
    });
  });

  // Search
  searchInput.addEventListener('input', () => {
    chrome.storage.local.get(['clipboardHistory'], (data) => {
      const history = data.clipboardHistory || [];
      const query = searchInput.value.toLowerCase();
      const filtered = history.filter(item =>
        item.content.toLowerCase().includes(query)
      );
      renderHistory(filtered);
    });
  });

  loadHistory();
});
