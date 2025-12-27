// Tab Search - Popup Script

class TabSearch {
  constructor() {
    this.tabs = [];
    this.filteredTabs = [];
    this.selectedIndex = 0;
    this.initElements();
    this.bindEvents();
    this.loadTabs();
  }

  initElements() {
    this.searchInput = document.getElementById('searchInput');
    this.tabCount = document.getElementById('tabCount');
    this.tabList = document.getElementById('tabList');
    this.noResults = document.getElementById('noResults');
  }

  bindEvents() {
    this.searchInput.addEventListener('input', () => {
      this.selectedIndex = 0;
      this.filterTabs();
    });

    this.searchInput.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.selectPrevious();
          break;
        case 'Enter':
          e.preventDefault();
          this.activateSelected();
          break;
        case 'Backspace':
          if (this.searchInput.value === '' && this.filteredTabs.length > 0) {
            e.preventDefault();
            this.closeSelected();
          }
          break;
      }
    });
  }

  async loadTabs() {
    this.tabs = await chrome.tabs.query({});
    this.tabCount.textContent = this.tabs.length;
    this.filterTabs();
  }

  filterTabs() {
    const query = this.searchInput.value.toLowerCase().trim();

    if (!query) {
      this.filteredTabs = [...this.tabs];
    } else {
      this.filteredTabs = this.tabs.filter(tab => {
        const title = tab.title.toLowerCase();
        const url = tab.url.toLowerCase();
        return title.includes(query) || url.includes(query);
      });
    }

    // Sort: current window first, then by last accessed
    const currentWindowId = chrome.windows.WINDOW_ID_CURRENT;
    this.filteredTabs.sort((a, b) => {
      if (a.windowId === currentWindowId && b.windowId !== currentWindowId) return -1;
      if (b.windowId === currentWindowId && a.windowId !== currentWindowId) return 1;
      return (b.lastAccessed || 0) - (a.lastAccessed || 0);
    });

    this.renderTabs();
  }

  renderTabs() {
    this.tabList.innerHTML = '';

    if (this.filteredTabs.length === 0) {
      this.noResults.classList.remove('hidden');
      return;
    }

    this.noResults.classList.add('hidden');
    const query = this.searchInput.value.toLowerCase().trim();

    this.filteredTabs.forEach((tab, index) => {
      const item = document.createElement('div');
      item.className = `tab-item ${index === this.selectedIndex ? 'selected' : ''} ${tab.active ? 'active' : ''}`;

      const title = this.highlightMatch(tab.title, query);
      const url = this.highlightMatch(this.truncateUrl(tab.url), query);

      item.innerHTML = `
        <div class="tab-favicon">
          ${tab.favIconUrl ? `<img src="${tab.favIconUrl}" onerror="this.parentElement.textContent='🔗'">` : '🔗'}
        </div>
        <div class="tab-info">
          <div class="tab-title">${title}</div>
          <div class="tab-url">${url}</div>
        </div>
        <button class="tab-close" data-id="${tab.id}" title="關閉分頁">✕</button>
      `;

      // Click to switch
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.tab-close')) {
          this.activateTab(tab);
        }
      });

      // Close button
      const closeBtn = item.querySelector('.tab-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      });

      this.tabList.appendChild(item);
    });

    // Scroll selected into view
    this.scrollSelectedIntoView();
  }

  highlightMatch(text, query) {
    if (!query) return this.escapeHtml(text);

    const escaped = this.escapeHtml(text);
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return escaped.replace(regex, '<span class="highlight">$1</span>');
  }

  truncateUrl(url) {
    try {
      const parsed = new URL(url);
      let display = parsed.hostname.replace('www.', '');
      if (parsed.pathname !== '/') {
        display += parsed.pathname;
      }
      return display.length > 50 ? display.substring(0, 50) + '...' : display;
    } catch {
      return url.substring(0, 50);
    }
  }

  selectNext() {
    if (this.filteredTabs.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.filteredTabs.length;
    this.renderTabs();
  }

  selectPrevious() {
    if (this.filteredTabs.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.filteredTabs.length) % this.filteredTabs.length;
    this.renderTabs();
  }

  scrollSelectedIntoView() {
    const selected = this.tabList.querySelector('.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }

  activateSelected() {
    if (this.filteredTabs.length === 0) return;
    const tab = this.filteredTabs[this.selectedIndex];
    this.activateTab(tab);
  }

  async activateTab(tab) {
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    window.close();
  }

  closeSelected() {
    if (this.filteredTabs.length === 0) return;
    const tab = this.filteredTabs[this.selectedIndex];
    this.closeTab(tab.id);
  }

  async closeTab(tabId) {
    await chrome.tabs.remove(tabId);

    // Remove from arrays
    this.tabs = this.tabs.filter(t => t.id !== tabId);
    this.filteredTabs = this.filteredTabs.filter(t => t.id !== tabId);

    // Adjust selected index
    if (this.selectedIndex >= this.filteredTabs.length) {
      this.selectedIndex = Math.max(0, this.filteredTabs.length - 1);
    }

    this.tabCount.textContent = this.tabs.length;
    this.renderTabs();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TabSearch();
});
