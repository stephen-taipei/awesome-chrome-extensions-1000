// Text Expander - Popup Script

class TextExpander {
  constructor() {
    this.snippets = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.shortcutEl = document.getElementById('shortcut');
    this.expansionEl = document.getElementById('expansion');
    this.addBtn = document.getElementById('addSnippet');
    this.searchEl = document.getElementById('search');
    this.listEl = document.getElementById('snippetsList');
    this.countEl = document.getElementById('snippetCount');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addSnippet());
    this.searchEl.addEventListener('input', () => this.render());

    this.shortcutEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.expansionEl.focus();
      }
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('textSnippets');
    if (result.textSnippets) {
      this.snippets = result.textSnippets;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ textSnippets: this.snippets });
  }

  addSnippet() {
    const shortcut = this.shortcutEl.value.trim();
    const expansion = this.expansionEl.value.trim();

    if (!shortcut || !expansion) return;

    // Check for duplicate shortcut
    if (this.snippets.some(s => s.shortcut === shortcut)) {
      alert('This shortcut already exists. Please use a different one.');
      return;
    }

    this.snippets.unshift({
      id: Date.now(),
      shortcut,
      expansion,
      createdAt: Date.now()
    });

    this.saveData();
    this.render();

    // Clear form
    this.shortcutEl.value = '';
    this.expansionEl.value = '';
    this.shortcutEl.focus();
  }

  async copySnippet(id) {
    const snippet = this.snippets.find(s => s.id === id);
    if (!snippet) return;

    await navigator.clipboard.writeText(snippet.expansion);

    const btn = document.querySelector(`[data-copy="${id}"]`);
    if (btn) {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 1000);
    }
  }

  deleteSnippet(id) {
    this.snippets = this.snippets.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  getFilteredSnippets() {
    const query = this.searchEl.value.toLowerCase().trim();
    if (!query) return this.snippets;

    return this.snippets.filter(s =>
      s.shortcut.toLowerCase().includes(query) ||
      s.expansion.toLowerCase().includes(query)
    );
  }

  render() {
    const filtered = this.getFilteredSnippets();
    this.countEl.textContent = this.snippets.length;

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No snippets found</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(snippet => `
      <div class="snippet-item">
        <div class="snippet-header">
          <span class="snippet-shortcut">${this.escapeHtml(snippet.shortcut)}</span>
          <div class="snippet-actions">
            <button class="copy-snippet-btn" data-copy="${snippet.id}">Copy</button>
            <button class="delete-snippet-btn" data-delete="${snippet.id}">Delete</button>
          </div>
        </div>
        <div class="snippet-expansion">${this.escapeHtml(snippet.expansion)}</div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copySnippet(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSnippet(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new TextExpander());
