document.addEventListener('DOMContentLoaded', () => {
  let selectedColor = '#ffeb3b';

  const colorBtns = document.querySelectorAll('.color-btn');
  const highlightBtn = document.getElementById('highlightBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const highlightsList = document.getElementById('highlightsList');
  const highlightCount = document.getElementById('highlightCount');

  loadHighlights();

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });

  highlightBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getSelectedText
    }, (results) => {
      if (results && results[0] && results[0].result) {
        saveHighlight(results[0].result, selectedColor, tab.url);
      }
    });
  });

  clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all highlights?')) {
      chrome.storage.local.set({ highlights: [] }, loadHighlights);
    }
  });

  function getSelectedText() {
    return window.getSelection().toString().trim();
  }

  function saveHighlight(text, color, url) {
    if (!text) return;

    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      highlights.unshift({
        id: Date.now(),
        text: text.substring(0, 200),
        color: color,
        url: url,
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ highlights }, loadHighlights);
    });
  }

  function loadHighlights() {
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      highlightCount.textContent = highlights.length;

      if (highlights.length === 0) {
        highlightsList.innerHTML = '<p class="empty-message">No highlights saved yet</p>';
        return;
      }

      highlightsList.innerHTML = highlights.map(h => `
        <div class="highlight-item" style="border-left-color: ${h.color}; background: ${h.color}22;">
          <button class="delete-btn" data-id="${h.id}">&times;</button>
          <div class="text">${escapeHtml(h.text)}</div>
          <div class="meta">${new Date(h.date).toLocaleDateString()}</div>
        </div>
      `).join('');

      highlightsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteHighlight(parseInt(btn.dataset.id)));
      });
    });
  }

  function deleteHighlight(id) {
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = (result.highlights || []).filter(h => h.id !== id);
      chrome.storage.local.set({ highlights }, loadHighlights);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
