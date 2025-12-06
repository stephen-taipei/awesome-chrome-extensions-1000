document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const colorBtns = document.querySelectorAll('.color-btn');
  const highlightBtn = document.getElementById('highlightBtn');
  const clearBtn = document.getElementById('clearBtn');
  const highlightsList = document.getElementById('highlightsList');
  const highlightCountEl = document.getElementById('highlightCount');

  let currentColor = '#ffeb3b';
  let highlights = [];
  let currentUrl = '';

  // Get current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentUrl = tabs[0].url;
    loadHighlights();
  });

  function loadHighlights() {
    chrome.storage.local.get(['pageHighlights'], (result) => {
      const allHighlights = result.pageHighlights || {};
      highlights = allHighlights[currentUrl] || [];
      renderHighlights();
    });
  }

  function renderHighlights() {
    highlightCountEl.textContent = `${highlights.length} highlight${highlights.length !== 1 ? 's' : ''}`;

    if (highlights.length === 0) {
      highlightsList.innerHTML = `
        <div class="empty-state">
          <div class="icon">🖍️</div>
          <p>No highlights on this page</p>
        </div>
      `;
      return;
    }

    highlightsList.innerHTML = highlights.map((h, index) => `
      <div class="highlight-item" data-index="${index}">
        <div class="highlight-color" style="background: ${h.color}"></div>
        <div class="highlight-content">
          <div class="highlight-text">${escapeHtml(h.text)}</div>
          <div class="highlight-meta">${formatDate(h.createdAt)}</div>
        </div>
        <button class="highlight-delete">×</button>
      </div>
    `).join('');

    // Add delete listeners
    document.querySelectorAll('.highlight-delete').forEach((btn, index) => {
      btn.addEventListener('click', () => deleteHighlight(index));
    });
  }

  function highlightSelection() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getSelectionText
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const text = results[0].result;
          if (text.trim()) {
            addHighlight(text);

            // Apply highlight on page
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: applyHighlight,
              args: [currentColor]
            });
          }
        }
      });
    });
  }

  function addHighlight(text) {
    highlights.push({
      text,
      color: currentColor,
      createdAt: Date.now()
    });
    saveHighlights();
    renderHighlights();
  }

  function deleteHighlight(index) {
    highlights.splice(index, 1);
    saveHighlights();
    renderHighlights();
  }

  function clearAllHighlights() {
    if (confirm('Clear all highlights on this page?')) {
      highlights = [];
      saveHighlights();
      renderHighlights();
    }
  }

  function saveHighlights() {
    chrome.storage.local.get(['pageHighlights'], (result) => {
      const allHighlights = result.pageHighlights || {};
      allHighlights[currentUrl] = highlights;
      chrome.storage.local.set({ pageHighlights: allHighlights });
    });
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = btn.dataset.color;

      // Update toggle color
      document.querySelector('.toggle input:checked + .slider').style.background = currentColor;
    });
  });

  highlightBtn.addEventListener('click', highlightSelection);
  clearBtn.addEventListener('click', clearAllHighlights);
});

// Functions to be injected into the page
function getSelectionText() {
  return window.getSelection().toString();
}

function applyHighlight(color) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.style.padding = '2px 0';
    span.style.borderRadius = '2px';
    range.surroundContents(span);
    selection.removeAllRanges();
  }
}
