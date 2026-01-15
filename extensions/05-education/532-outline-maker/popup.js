document.addEventListener('DOMContentLoaded', () => {
  const outlineTitle = document.getElementById('outlineTitle');
  const extractHeadingsBtn = document.getElementById('extractHeadingsBtn');
  const itemLevel = document.getElementById('itemLevel');
  const itemText = document.getElementById('itemText');
  const addItemBtn = document.getElementById('addItemBtn');
  const outlineContent = document.getElementById('outlineContent');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const savedOutlines = document.getElementById('savedOutlines');

  let outlineItems = [];

  loadSavedOutlines();

  extractHeadingsBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const headings = document.querySelectorAll('h1, h2, h3, h4');
        return Array.from(headings).map(h => ({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent.trim()
        })).filter(h => h.text.length > 0);
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const headings = results[0].result;
        headings.forEach(h => {
          const level = Math.min(h.level, 3);
          outlineItems.push({
            id: Date.now() + Math.random(),
            level: level,
            text: h.text
          });
        });
        renderOutline();
      }
    });
  });

  addItemBtn.addEventListener('click', addItem);
  itemText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addItem();
  });

  function addItem() {
    const text = itemText.value.trim();
    if (!text) return;

    outlineItems.push({
      id: Date.now(),
      level: parseInt(itemLevel.value),
      text: text
    });

    itemText.value = '';
    renderOutline();
  }

  copyBtn.addEventListener('click', () => {
    const text = outlineItems.map(item => {
      const indent = '  '.repeat(item.level - 1);
      const bullet = item.level === 1 ? '' : '- ';
      return `${indent}${bullet}${item.text}`;
    }).join('\n');

    navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
  });

  saveBtn.addEventListener('click', () => {
    const title = outlineTitle.value.trim() || 'Untitled Outline';

    chrome.storage.local.get(['outlines'], (result) => {
      const outlines = result.outlines || [];
      outlines.unshift({
        id: Date.now(),
        title: title,
        items: [...outlineItems],
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ outlines: outlines.slice(0, 30) }, loadSavedOutlines);
    });
  });

  clearBtn.addEventListener('click', () => {
    if (outlineItems.length > 0 && confirm('Clear current outline?')) {
      outlineItems = [];
      outlineTitle.value = '';
      renderOutline();
    }
  });

  function renderOutline() {
    copyBtn.disabled = outlineItems.length === 0;
    saveBtn.disabled = outlineItems.length === 0;

    if (outlineItems.length === 0) {
      outlineContent.innerHTML = '<p class="empty-message">Start building your outline</p>';
      return;
    }

    outlineContent.innerHTML = outlineItems.map(item => {
      const bullets = { 1: '&#9679;', 2: '&#9675;', 3: '&#9702;' };
      return `
        <div class="outline-item level-${item.level}">
          <span class="bullet">${bullets[item.level]}</span>
          <span class="text">${escapeHtml(item.text)}</span>
          <button class="delete-btn" data-id="${item.id}">&times;</button>
        </div>
      `;
    }).join('');

    outlineContent.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        outlineItems = outlineItems.filter(i => i.id !== parseFloat(btn.dataset.id));
        renderOutline();
      });
    });
  }

  function loadSavedOutlines() {
    chrome.storage.local.get(['outlines'], (result) => {
      const outlines = result.outlines || [];

      if (outlines.length === 0) {
        savedOutlines.innerHTML = '<p class="empty-message">No saved outlines</p>';
        return;
      }

      savedOutlines.innerHTML = outlines.map(o => `
        <div class="saved-item" data-id="${o.id}">
          <button class="delete-btn" data-id="${o.id}">&times;</button>
          <div class="title">${escapeHtml(o.title)}</div>
          <div class="meta">${o.items.length} items - ${new Date(o.date).toLocaleDateString()}</div>
        </div>
      `).join('');

      savedOutlines.querySelectorAll('.saved-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-btn')) return;
          loadOutline(parseInt(item.dataset.id));
        });
      });

      savedOutlines.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteOutline(parseInt(btn.dataset.id));
        });
      });
    });
  }

  function loadOutline(id) {
    chrome.storage.local.get(['outlines'], (result) => {
      const outlines = result.outlines || [];
      const outline = outlines.find(o => o.id === id);
      if (outline) {
        outlineTitle.value = outline.title;
        outlineItems = [...outline.items];
        renderOutline();
      }
    });
  }

  function deleteOutline(id) {
    chrome.storage.local.get(['outlines'], (result) => {
      const outlines = (result.outlines || []).filter(o => o.id !== id);
      chrome.storage.local.set({ outlines }, loadSavedOutlines);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
