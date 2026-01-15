document.addEventListener('DOMContentLoaded', () => {
  const sourceType = document.getElementById('sourceType');
  const titleInput = document.getElementById('title');
  const authorInput = document.getElementById('author');
  const dateInput = document.getElementById('date');
  const urlInput = document.getElementById('url');
  const publisherInput = document.getElementById('publisher');
  const autoFillBtn = document.getElementById('autoFillBtn');
  const styleBtns = document.querySelectorAll('.style-btn');
  const citationOutput = document.getElementById('citationOutput');
  const copyBtn = document.getElementById('copyBtn');
  const savedCitations = document.getElementById('savedCitations');

  let currentStyle = 'apa';
  let currentCitation = '';

  loadSavedCitations();

  autoFillBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    titleInput.value = tab.title || '';
    urlInput.value = tab.url || '';
    dateInput.value = new Date().toISOString().split('T')[0];

    const hostname = new URL(tab.url).hostname.replace('www.', '');
    publisherInput.value = hostname.charAt(0).toUpperCase() + hostname.slice(1);

    generateCitation();
  });

  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      styleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStyle = btn.dataset.style;
      generateCitation();
    });
  });

  [titleInput, authorInput, dateInput, urlInput, publisherInput, sourceType].forEach(el => {
    el.addEventListener('input', generateCitation);
    el.addEventListener('change', generateCitation);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentCitation);
    saveCitation(currentCitation, currentStyle);
    copyBtn.textContent = 'Copied & Saved!';
    setTimeout(() => copyBtn.textContent = 'Copy Citation', 2000);
  });

  function generateCitation() {
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const date = dateInput.value.trim();
    const url = urlInput.value.trim();
    const publisher = publisherInput.value.trim();

    if (!title) {
      citationOutput.innerHTML = '<p class="placeholder">Fill in details to generate citation</p>';
      copyBtn.disabled = true;
      return;
    }

    const parsedDate = date ? new Date(date) : null;
    const year = parsedDate ? parsedDate.getFullYear() : 'n.d.';
    const monthDay = parsedDate ? parsedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '';

    switch (currentStyle) {
      case 'apa':
        currentCitation = formatAPA(author, year, title, publisher, url);
        break;
      case 'mla':
        currentCitation = formatMLA(author, title, publisher, date, url);
        break;
      case 'chicago':
        currentCitation = formatChicago(author, title, publisher, monthDay, year, url);
        break;
    }

    citationOutput.innerHTML = `<div class="citation-text">${escapeHtml(currentCitation)}</div>`;
    copyBtn.disabled = false;
  }

  function formatAPA(author, year, title, publisher, url) {
    const authorPart = author ? `${author}` : publisher;
    return `${authorPart}. (${year}). ${title}. ${publisher}. ${url}`;
  }

  function formatMLA(author, title, publisher, date, url) {
    const authorPart = author ? `${author}. ` : '';
    const datePart = date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return `${authorPart}"${title}." ${publisher}, ${datePart}, ${url}.`;
  }

  function formatChicago(author, title, publisher, monthDay, year, url) {
    const authorPart = author ? `${author}. ` : '';
    const datePart = monthDay ? `${monthDay}, ${year}` : year;
    return `${authorPart}"${title}." ${publisher}. Accessed ${datePart}. ${url}.`;
  }

  function saveCitation(citation, style) {
    chrome.storage.local.get(['citations'], (result) => {
      const citations = result.citations || [];
      citations.unshift({
        id: Date.now(),
        text: citation,
        style: style,
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ citations: citations.slice(0, 50) }, loadSavedCitations);
    });
  }

  function loadSavedCitations() {
    chrome.storage.local.get(['citations'], (result) => {
      const citations = result.citations || [];

      if (citations.length === 0) {
        savedCitations.innerHTML = '<p class="empty-message">No saved citations</p>';
        return;
      }

      savedCitations.innerHTML = citations.slice(0, 5).map(c => `
        <div class="saved-item">
          <button class="delete-btn" data-id="${c.id}">&times;</button>
          <div class="citation-text">${escapeHtml(c.text.substring(0, 100))}...</div>
          <span class="style-badge">${c.style.toUpperCase()}</span>
        </div>
      `).join('');

      savedCitations.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteCitation(parseInt(btn.dataset.id)));
      });
    });
  }

  function deleteCitation(id) {
    chrome.storage.local.get(['citations'], (result) => {
      const citations = (result.citations || []).filter(c => c.id !== id);
      chrome.storage.local.set({ citations }, loadSavedCitations);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
