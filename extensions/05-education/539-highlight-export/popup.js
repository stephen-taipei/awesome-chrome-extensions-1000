document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('captureBtn');
  const highlightsList = document.getElementById('highlightsList');
  const formatRadios = document.querySelectorAll('input[name="format"]');
  const includeSource = document.getElementById('includeSource');
  const includeDate = document.getElementById('includeDate');
  const groupBySource = document.getElementById('groupBySource');
  const exportPreview = document.getElementById('exportPreview');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  loadHighlights();

  captureBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    }, (results) => {
      if (results && results[0] && results[0].result) {
        saveHighlight(results[0].result, tab.url, tab.title);
      } else {
        alert('Please select text on the page first');
      }
    });
  });

  formatRadios.forEach(r => r.addEventListener('change', updatePreview));
  [includeSource, includeDate, groupBySource].forEach(el => {
    el.addEventListener('change', updatePreview);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(exportPreview.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
  });

  downloadBtn.addEventListener('click', () => {
    const format = document.querySelector('input[name="format"]:checked').value;
    const extensions = { text: 'txt', markdown: 'md', html: 'html' };
    const blob = new Blob([exportPreview.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `highlights.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  });

  clearAllBtn.addEventListener('click', () => {
    if (confirm('Clear all highlights?')) {
      chrome.storage.local.set({ exportHighlights: [] }, () => {
        loadHighlights();
        updatePreview();
      });
    }
  });

  function saveHighlight(text, url, title) {
    chrome.storage.local.get(['exportHighlights'], (result) => {
      const highlights = result.exportHighlights || [];
      highlights.push({
        id: Date.now(),
        text: text,
        url: url,
        title: title,
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ exportHighlights: highlights }, () => {
        loadHighlights();
        updatePreview();
      });
    });
  }

  function loadHighlights() {
    chrome.storage.local.get(['exportHighlights'], (result) => {
      const highlights = result.exportHighlights || [];

      if (highlights.length === 0) {
        highlightsList.innerHTML = '<p class="empty-message">No highlights saved</p>';
        copyBtn.disabled = true;
        downloadBtn.disabled = true;
        return;
      }

      copyBtn.disabled = false;
      downloadBtn.disabled = false;

      highlightsList.innerHTML = highlights.map(h => `
        <div class="highlight-item">
          <button class="delete-btn" data-id="${h.id}">&times;</button>
          <div class="text">${escapeHtml(h.text.substring(0, 80))}${h.text.length > 80 ? '...' : ''}</div>
          <div class="source">${escapeHtml(h.title || h.url)}</div>
        </div>
      `).join('');

      highlightsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteHighlight(parseInt(btn.dataset.id)));
      });

      updatePreview();
    });
  }

  function deleteHighlight(id) {
    chrome.storage.local.get(['exportHighlights'], (result) => {
      const highlights = (result.exportHighlights || []).filter(h => h.id !== id);
      chrome.storage.local.set({ exportHighlights: highlights }, () => {
        loadHighlights();
        updatePreview();
      });
    });
  }

  function updatePreview() {
    chrome.storage.local.get(['exportHighlights'], (result) => {
      const highlights = result.exportHighlights || [];

      if (highlights.length === 0) {
        exportPreview.innerHTML = '<p class="empty-message">Export preview will appear here</p>';
        return;
      }

      const format = document.querySelector('input[name="format"]:checked').value;
      const withSource = includeSource.checked;
      const withDate = includeDate.checked;
      const grouped = groupBySource.checked;

      let output = '';

      if (grouped) {
        const groups = {};
        highlights.forEach(h => {
          const key = h.title || h.url;
          if (!groups[key]) groups[key] = [];
          groups[key].push(h);
        });

        for (const [source, items] of Object.entries(groups)) {
          output += formatGroup(source, items, format, withSource, withDate);
        }
      } else {
        output = highlights.map(h => formatHighlight(h, format, withSource, withDate)).join('\n\n');
      }

      exportPreview.textContent = output;
    });
  }

  function formatHighlight(h, format, withSource, withDate) {
    let text = '';

    switch (format) {
      case 'markdown':
        text = `> ${h.text}`;
        if (withSource) text += `\n\n*Source: [${h.title || 'Link'}](${h.url})*`;
        if (withDate) text += `\n*Date: ${new Date(h.date).toLocaleDateString()}*`;
        break;
      case 'html':
        text = `<blockquote>${escapeHtml(h.text)}</blockquote>`;
        if (withSource) text += `\n<p><small>Source: <a href="${h.url}">${escapeHtml(h.title || 'Link')}</a></small></p>`;
        if (withDate) text += `\n<p><small>Date: ${new Date(h.date).toLocaleDateString()}</small></p>`;
        break;
      default:
        text = `"${h.text}"`;
        if (withSource) text += `\nSource: ${h.url}`;
        if (withDate) text += `\nDate: ${new Date(h.date).toLocaleDateString()}`;
    }

    return text;
  }

  function formatGroup(source, items, format, withSource, withDate) {
    let output = '';

    switch (format) {
      case 'markdown':
        output = `## ${source}\n\n`;
        items.forEach(h => {
          output += `> ${h.text}\n`;
          if (withDate) output += `*${new Date(h.date).toLocaleDateString()}*\n`;
          output += '\n';
        });
        break;
      case 'html':
        output = `<h2>${escapeHtml(source)}</h2>\n`;
        items.forEach(h => {
          output += `<blockquote>${escapeHtml(h.text)}</blockquote>\n`;
          if (withDate) output += `<small>${new Date(h.date).toLocaleDateString()}</small>\n`;
        });
        break;
      default:
        output = `=== ${source} ===\n\n`;
        items.forEach(h => {
          output += `"${h.text}"\n`;
          if (withDate) output += `Date: ${new Date(h.date).toLocaleDateString()}\n`;
          output += '\n';
        });
    }

    return output + '\n';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
