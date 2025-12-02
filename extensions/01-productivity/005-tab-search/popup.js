/**
 * Tab Search - Popup Script
 * Implements fuzzy search, regex search, and keyboard navigation
 */

class TabSearch {
  constructor() {
    this.tabs = [];
    this.filteredTabs = [];
    this.selectedIndex = 0;
    this.settings = {
      searchMode: 'fuzzy',
      caseSensitive: false,
      maxResults: 50,
      highlightMatch: true
    };

    this.elements = {
      searchInput: document.getElementById('searchInput'),
      resultsList: document.getElementById('resultsList'),
      resultCount: document.getElementById('resultCount'),
      totalCount: document.getElementById('totalCount'),
      emptyState: document.getElementById('emptyState'),
      modeToggle: document.getElementById('modeToggle'),
      modeLabel: document.getElementById('modeLabel'),
      caseSensitive: document.getElementById('caseSensitive'),
      regexMode: document.getElementById('regexMode'),
      domainFilter: document.getElementById('domainFilter'),
      windowFilter: document.getElementById('windowFilter')
    };

    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadTabs();
    this.bindEvents();
    this.updateUI();
    this.elements.searchInput.focus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'searchMode',
        'caseSensitive',
        'maxResults',
        'highlightMatch'
      ]);
      this.settings = { ...this.settings, ...result };

      // Update UI to reflect settings
      this.elements.caseSensitive.checked = this.settings.caseSensitive;
      this.elements.regexMode.checked = this.settings.searchMode === 'regex';
      this.updateModeLabel();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async loadTabs() {
    try {
      this.tabs = await chrome.tabs.query({});
      this.filteredTabs = [...this.tabs];
      this.elements.totalCount.textContent = this.tabs.length;
      this.populateFilters();
      this.renderResults();
    } catch (error) {
      console.error('Failed to load tabs:', error);
    }
  }

  populateFilters() {
    // Get unique domains
    const domains = new Map();
    const windows = new Map();

    this.tabs.forEach(tab => {
      try {
        const url = new URL(tab.url);
        const domain = url.hostname;
        domains.set(domain, (domains.get(domain) || 0) + 1);
      } catch {
        // Invalid URL, skip
      }
      windows.set(tab.windowId, (windows.get(tab.windowId) || 0) + 1);
    });

    // Populate domain filter
    const domainSelect = this.elements.domainFilter;
    domainSelect.innerHTML = '<option value="">All domains</option>';
    [...domains.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([domain, count]) => {
        const option = document.createElement('option');
        option.value = domain;
        option.textContent = `${domain} (${count})`;
        domainSelect.appendChild(option);
      });

    // Populate window filter
    const windowSelect = this.elements.windowFilter;
    windowSelect.innerHTML = '<option value="">All windows</option>';
    [...windows.entries()].forEach(([windowId, count], index) => {
      const option = document.createElement('option');
      option.value = windowId;
      option.textContent = `Window ${index + 1} (${count})`;
      windowSelect.appendChild(option);
    });
  }

  bindEvents() {
    // Search input
    this.elements.searchInput.addEventListener('input', () => this.handleSearch());

    // Keyboard navigation
    this.elements.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Mode toggle
    this.elements.modeToggle.addEventListener('click', () => this.toggleSearchMode());

    // Options
    this.elements.caseSensitive.addEventListener('change', (e) => {
      this.settings.caseSensitive = e.target.checked;
      this.saveSettings();
      this.handleSearch();
    });

    this.elements.regexMode.addEventListener('change', (e) => {
      this.settings.searchMode = e.target.checked ? 'regex' : 'fuzzy';
      this.updateModeLabel();
      this.saveSettings();
      this.handleSearch();
    });

    // Filters
    this.elements.domainFilter.addEventListener('change', () => this.handleSearch());
    this.elements.windowFilter.addEventListener('change', () => this.handleSearch());
  }

  toggleSearchMode() {
    const modes = ['fuzzy', 'exact', 'regex'];
    const currentIndex = modes.indexOf(this.settings.searchMode);
    this.settings.searchMode = modes[(currentIndex + 1) % modes.length];
    this.elements.regexMode.checked = this.settings.searchMode === 'regex';
    this.updateModeLabel();
    this.saveSettings();
    this.handleSearch();
  }

  updateModeLabel() {
    const labels = {
      fuzzy: 'Fuzzy',
      exact: 'Exact',
      regex: 'Regex'
    };
    this.elements.modeLabel.textContent = labels[this.settings.searchMode];
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        searchMode: this.settings.searchMode,
        caseSensitive: this.settings.caseSensitive
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  handleSearch() {
    const query = this.elements.searchInput.value.trim();
    const domainFilter = this.elements.domainFilter.value;
    const windowFilter = this.elements.windowFilter.value;

    let results = [...this.tabs];

    // Apply domain filter
    if (domainFilter) {
      results = results.filter(tab => {
        try {
          const url = new URL(tab.url);
          return url.hostname === domainFilter;
        } catch {
          return false;
        }
      });
    }

    // Apply window filter
    if (windowFilter) {
      const windowId = parseInt(windowFilter);
      results = results.filter(tab => tab.windowId === windowId);
    }

    // Apply search query
    if (query) {
      results = this.searchTabs(results, query);
    }

    this.filteredTabs = results.slice(0, this.settings.maxResults);
    this.selectedIndex = 0;
    this.renderResults();
  }

  searchTabs(tabs, query) {
    const caseSensitive = this.settings.caseSensitive;
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    switch (this.settings.searchMode) {
      case 'fuzzy':
        return this.fuzzySearch(tabs, searchQuery, caseSensitive);
      case 'exact':
        return this.exactSearch(tabs, searchQuery, caseSensitive);
      case 'regex':
        return this.regexSearch(tabs, query, caseSensitive);
      default:
        return this.fuzzySearch(tabs, searchQuery, caseSensitive);
    }
  }

  fuzzySearch(tabs, query, caseSensitive) {
    const results = tabs.map(tab => {
      const title = caseSensitive ? tab.title : (tab.title || '').toLowerCase();
      const url = caseSensitive ? tab.url : (tab.url || '').toLowerCase();

      const titleScore = this.fuzzyMatch(title, query);
      const urlScore = this.fuzzyMatch(url, query);
      const score = Math.max(titleScore, urlScore * 0.8); // Title matches weighted higher

      return { tab, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

    return results.map(item => item.tab);
  }

  fuzzyMatch(text, query) {
    if (!text || !query) return 0;

    let score = 0;
    let queryIndex = 0;
    let consecutiveMatches = 0;
    let lastMatchIndex = -1;

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        score += 1;

        // Bonus for consecutive matches
        if (lastMatchIndex === i - 1) {
          consecutiveMatches++;
          score += consecutiveMatches * 2;
        } else {
          consecutiveMatches = 0;
        }

        // Bonus for word boundary matches
        if (i === 0 || /[\s\-_./]/.test(text[i - 1])) {
          score += 5;
        }

        lastMatchIndex = i;
        queryIndex++;
      }
    }

    // Return 0 if not all query chars matched
    if (queryIndex < query.length) return 0;

    // Normalize score by query length
    return score / query.length;
  }

  exactSearch(tabs, query, caseSensitive) {
    return tabs.filter(tab => {
      const title = caseSensitive ? tab.title : (tab.title || '').toLowerCase();
      const url = caseSensitive ? tab.url : (tab.url || '').toLowerCase();
      return title.includes(query) || url.includes(query);
    });
  }

  regexSearch(tabs, query, caseSensitive) {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(query, flags);

      return tabs.filter(tab => {
        return regex.test(tab.title || '') || regex.test(tab.url || '');
      });
    } catch (error) {
      // Invalid regex, fall back to exact search
      console.warn('Invalid regex:', error);
      return this.exactSearch(tabs, query, caseSensitive);
    }
  }

  renderResults() {
    const list = this.elements.resultsList;
    const query = this.elements.searchInput.value.trim();

    list.innerHTML = '';

    if (this.filteredTabs.length === 0) {
      this.elements.emptyState.classList.remove('hidden');
      this.elements.resultCount.textContent = '0';
      return;
    }

    this.elements.emptyState.classList.add('hidden');
    this.elements.resultCount.textContent = this.filteredTabs.length;

    this.filteredTabs.forEach((tab, index) => {
      const item = this.createResultItem(tab, index, query);
      list.appendChild(item);
    });
  }

  createResultItem(tab, index, query) {
    const li = document.createElement('li');
    li.className = 'result-item';
    if (index === this.selectedIndex) li.classList.add('selected');
    if (tab.active) li.classList.add('active-tab');

    li.innerHTML = `
      ${tab.pinned ? '<svg class="pinned-indicator" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z"/></svg>' : ''}
      ${tab.audible ? '<svg class="audio-indicator" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' : ''}
      ${tab.favIconUrl ? `<img class="tab-favicon" src="${this.escapeHtml(tab.favIconUrl)}" onerror="this.style.display='none'">` : '<div class="tab-favicon-placeholder">?</div>'}
      <div class="tab-info">
        <div class="tab-title">${this.highlightText(tab.title || 'Untitled', query)}</div>
        <div class="tab-url">${this.highlightText(this.truncateUrl(tab.url), query)}</div>
      </div>
      <span class="window-badge">W${this.getWindowIndex(tab.windowId)}</span>
      <div class="tab-actions">
        <button class="action-btn close-btn" title="Close tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;

    // Click to switch
    li.addEventListener('click', (e) => {
      if (e.target.closest('.close-btn')) {
        this.closeTab(tab);
      } else {
        this.switchToTab(tab);
      }
    });

    return li;
  }

  getWindowIndex(windowId) {
    const windows = [...new Set(this.tabs.map(t => t.windowId))];
    return windows.indexOf(windowId) + 1;
  }

  highlightText(text, query) {
    if (!query || !this.settings.highlightMatch) {
      return this.escapeHtml(text);
    }

    const escaped = this.escapeHtml(text);
    const escapedQuery = this.escapeHtml(query);

    if (this.settings.searchMode === 'regex') {
      try {
        const flags = this.settings.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(`(${query})`, flags);
        return text.replace(regex, '<span class="highlight">$1</span>');
      } catch {
        return escaped;
      }
    }

    // Simple highlight for fuzzy/exact
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index !== -1) {
      const before = this.escapeHtml(text.slice(0, index));
      const match = this.escapeHtml(text.slice(index, index + query.length));
      const after = this.escapeHtml(text.slice(index + query.length));
      return `${before}<span class="highlight">${match}</span>${after}`;
    }

    return escaped;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  truncateUrl(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      let path = parsed.pathname + parsed.search;
      if (path.length > 50) {
        path = path.slice(0, 47) + '...';
      }
      return parsed.hostname + path;
    } catch {
      return url.slice(0, 60);
    }
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.moveSelection(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveSelection(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.filteredTabs[this.selectedIndex]) {
          this.switchToTab(this.filteredTabs[this.selectedIndex]);
        }
        break;
      case 'Delete':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (this.filteredTabs[this.selectedIndex]) {
            this.closeTab(this.filteredTabs[this.selectedIndex]);
          }
        }
        break;
      case 'Escape':
        window.close();
        break;
    }
  }

  moveSelection(direction) {
    const newIndex = this.selectedIndex + direction;
    if (newIndex >= 0 && newIndex < this.filteredTabs.length) {
      this.selectedIndex = newIndex;
      this.updateSelection();
    }
  }

  updateSelection() {
    const items = this.elements.resultsList.querySelectorAll('.result-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });

    // Scroll into view
    const selectedItem = items[this.selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  async switchToTab(tab) {
    try {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      window.close();
    } catch (error) {
      console.error('Failed to switch to tab:', error);
    }
  }

  async closeTab(tab) {
    try {
      await chrome.tabs.remove(tab.id);
      this.tabs = this.tabs.filter(t => t.id !== tab.id);
      this.elements.totalCount.textContent = this.tabs.length;
      this.handleSearch();
    } catch (error) {
      console.error('Failed to close tab:', error);
    }
  }

  updateUI() {
    this.updateModeLabel();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TabSearch();
});
