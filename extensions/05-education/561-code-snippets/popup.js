document.addEventListener('DOMContentLoaded', () => {
  const snippetTitle = document.getElementById('snippetTitle');
  const snippetLanguage = document.getElementById('snippetLanguage');
  const snippetCode = document.getElementById('snippetCode');
  const snippetTags = document.getElementById('snippetTags');
  const saveSnippet = document.getElementById('saveSnippet');
  const searchInput = document.getElementById('searchInput');
  const filterLanguage = document.getElementById('filterLanguage');
  const snippetsList = document.getElementById('snippetsList');
  const snippetCount = document.getElementById('snippetCount');

  let snippets = [];

  // Load snippets
  function loadSnippets() {
    chrome.storage.local.get(['codeSnippets'], (result) => {
      snippets = result.codeSnippets || [];
      renderSnippets();
    });
  }

  // Save snippets
  function saveSnippets() {
    chrome.storage.local.set({ codeSnippets: snippets }, () => {
      renderSnippets();
    });
  }

  // Render snippets
  function renderSnippets() {
    const searchTerm = searchInput.value.toLowerCase();
    const langFilter = filterLanguage.value;

    const filtered = snippets.filter(snippet => {
      const matchesSearch = snippet.title.toLowerCase().includes(searchTerm) ||
        snippet.code.toLowerCase().includes(searchTerm) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      const matchesLang = langFilter === 'all' || snippet.language === langFilter;
      return matchesSearch && matchesLang;
    });

    if (filtered.length === 0) {
      snippetsList.innerHTML = '<div class="empty-state">No snippets found</div>';
    } else {
      snippetsList.innerHTML = filtered.map((snippet, index) => `
        <div class="snippet-item" data-id="${snippet.id}">
          <div class="snippet-header">
            <span class="snippet-title">${escapeHtml(snippet.title)}</span>
            <span class="snippet-language">${snippet.language}</span>
          </div>
          <div class="snippet-code">${escapeHtml(snippet.code)}</div>
          ${snippet.tags.length > 0 ? `
            <div class="snippet-tags">
              ${snippet.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}
            </div>
          ` : ''}
          <div class="snippet-actions">
            <button class="copy-btn" data-id="${snippet.id}">Copy</button>
            <button class="delete-btn" data-id="${snippet.id}">Delete</button>
          </div>
        </div>
      `).join('');
    }

    snippetCount.textContent = `${snippets.length} snippet${snippets.length !== 1 ? 's' : ''}`;

    // Add event listeners
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const snippet = snippets.find(s => s.id === id);
        if (snippet) {
          navigator.clipboard.writeText(snippet.code);
          e.target.textContent = 'Copied!';
          setTimeout(() => e.target.textContent = 'Copy', 1500);
        }
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        snippets = snippets.filter(s => s.id !== id);
        saveSnippets();
      });
    });
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Save new snippet
  saveSnippet.addEventListener('click', () => {
    const title = snippetTitle.value.trim();
    const code = snippetCode.value.trim();

    if (!title || !code) {
      alert('Please enter a title and code');
      return;
    }

    const newSnippet = {
      id: Date.now().toString(),
      title,
      language: snippetLanguage.value,
      code,
      tags: snippetTags.value.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date().toISOString()
    };

    snippets.unshift(newSnippet);
    saveSnippets();

    // Clear form
    snippetTitle.value = '';
    snippetCode.value = '';
    snippetTags.value = '';
  });

  // Search and filter
  searchInput.addEventListener('input', renderSnippets);
  filterLanguage.addEventListener('change', renderSnippets);

  // Initialize
  loadSnippets();
});
