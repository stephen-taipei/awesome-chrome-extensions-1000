// Tab Suspender - Popup Script

class TabSuspender {
  constructor() {
    this.suspendedTabs = new Map(); // Store suspended tab info
    this.initElements();
    this.bindEvents();
    this.loadSettings();
    this.loadTabs();
  }

  initElements() {
    this.totalTabsEl = document.getElementById('totalTabs');
    this.activeTabsEl = document.getElementById('activeTabs');
    this.suspendedTabsEl = document.getElementById('suspendedTabs');
    this.savedMemoryEl = document.getElementById('savedMemory');

    this.activeTabList = document.getElementById('activeTabList');
    this.suspendedTabList = document.getElementById('suspendedTabList');

    this.suspendCurrentBtn = document.getElementById('suspendCurrentBtn');
    this.suspendOthersBtn = document.getElementById('suspendOthersBtn');
    this.suspendAllBtn = document.getElementById('suspendAllBtn');
    this.restoreAllBtn = document.getElementById('restoreAllBtn');

    this.autoSuspendTime = document.getElementById('autoSuspendTime');
  }

  bindEvents() {
    this.suspendCurrentBtn.addEventListener('click', () => this.suspendCurrentTab());
    this.suspendOthersBtn.addEventListener('click', () => this.suspendOtherTabs());
    this.suspendAllBtn.addEventListener('click', () => this.suspendAllTabs());
    this.restoreAllBtn.addEventListener('click', () => this.restoreAllTabs());
    this.autoSuspendTime.addEventListener('change', () => this.saveSettings());
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['tabSuspenderSettings', 'suspendedTabsData']);
    const settings = result.tabSuspenderSettings || { autoSuspendMinutes: 30 };
    this.autoSuspendTime.value = settings.autoSuspendMinutes.toString();

    // Load suspended tabs data
    if (result.suspendedTabsData) {
      this.suspendedTabs = new Map(Object.entries(result.suspendedTabsData));
    }
  }

  async saveSettings() {
    await chrome.storage.local.set({
      tabSuspenderSettings: {
        autoSuspendMinutes: parseInt(this.autoSuspendTime.value)
      }
    });
  }

  async saveSuspendedData() {
    await chrome.storage.local.set({
      suspendedTabsData: Object.fromEntries(this.suspendedTabs)
    });
  }

  async loadTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    const activeTabs = tabs.filter(t => !t.discarded && !t.url.startsWith('chrome://'));
    const discardedTabs = tabs.filter(t => t.discarded);

    this.totalTabsEl.textContent = tabs.length;
    this.activeTabsEl.textContent = activeTabs.length;
    this.suspendedTabsEl.textContent = discardedTabs.length;

    // Estimate saved memory (rough estimate: ~50MB per suspended tab)
    this.savedMemoryEl.textContent = (discardedTabs.length * 50).toString();

    this.renderActiveTabs(activeTabs);
    this.renderSuspendedTabs(discardedTabs);
  }

  renderActiveTabs(tabs) {
    this.activeTabList.innerHTML = '';

    if (tabs.length === 0) {
      this.activeTabList.innerHTML = '<div class="empty-list">沒有使用中的分頁</div>';
      return;
    }

    tabs.slice(0, 8).forEach(tab => {
      const item = this.createTabItem(tab, false);
      this.activeTabList.appendChild(item);
    });

    if (tabs.length > 8) {
      const more = document.createElement('div');
      more.className = 'empty-list';
      more.textContent = `還有 ${tabs.length - 8} 個分頁...`;
      this.activeTabList.appendChild(more);
    }
  }

  renderSuspendedTabs(tabs) {
    this.suspendedTabList.innerHTML = '';

    if (tabs.length === 0) {
      this.suspendedTabList.innerHTML = '<div class="empty-list">沒有已暫停的分頁</div>';
      return;
    }

    tabs.slice(0, 8).forEach(tab => {
      const item = this.createTabItem(tab, true);
      this.suspendedTabList.appendChild(item);
    });

    if (tabs.length > 8) {
      const more = document.createElement('div');
      more.className = 'empty-list';
      more.textContent = `還有 ${tabs.length - 8} 個分頁...`;
      this.suspendedTabList.appendChild(more);
    }
  }

  createTabItem(tab, isSuspended) {
    const item = document.createElement('div');
    item.className = `tab-item ${isSuspended ? 'suspended' : ''}`;

    item.innerHTML = `
      <div class="tab-favicon">
        ${tab.favIconUrl ? `<img src="${tab.favIconUrl}" onerror="this.parentElement.textContent='🔗'">` : '🔗'}
      </div>
      <span class="tab-title">${this.escapeHtml(tab.title)}</span>
      <button class="tab-action ${isSuspended ? 'restore' : 'suspend'}" data-id="${tab.id}" title="${isSuspended ? '恢復' : '暫停'}">
        ${isSuspended ? '▶️' : '💤'}
      </button>
    `;

    const actionBtn = item.querySelector('.tab-action');
    actionBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (isSuspended) {
        await this.restoreTab(tab.id);
      } else {
        await this.suspendTab(tab.id);
      }
    });

    item.addEventListener('click', () => {
      chrome.tabs.update(tab.id, { active: true });
    });

    return item;
  }

  async suspendTab(tabId) {
    try {
      // Get tab info before discarding
      const tab = await chrome.tabs.get(tabId);

      // Store tab info
      this.suspendedTabs.set(tabId.toString(), {
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl,
        suspendedAt: Date.now()
      });
      await this.saveSuspendedData();

      // Discard the tab
      await chrome.tabs.discard(tabId);
      this.loadTabs();
    } catch (error) {
      console.error('Failed to suspend tab:', error);
    }
  }

  async restoreTab(tabId) {
    try {
      // Simply activate the tab to reload it
      await chrome.tabs.update(tabId, { active: true });

      // Remove from suspended data
      this.suspendedTabs.delete(tabId.toString());
      await this.saveSuspendedData();

      this.loadTabs();
    } catch (error) {
      console.error('Failed to restore tab:', error);
    }
  }

  async suspendCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && !tab.url.startsWith('chrome://')) {
      await this.suspendTab(tab.id);
    }
  }

  async suspendOtherTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    for (const tab of tabs) {
      if (tab.id !== activeTab.id && !tab.discarded && !tab.url.startsWith('chrome://')) {
        await this.suspendTab(tab.id);
      }
    }
  }

  async suspendAllTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    for (const tab of tabs) {
      // Don't suspend the active tab
      if (tab.id !== activeTab.id && !tab.discarded && !tab.url.startsWith('chrome://')) {
        await this.suspendTab(tab.id);
      }
    }
  }

  async restoreAllTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true, discarded: true });

    for (const tab of tabs) {
      // Reload each tab
      await chrome.tabs.reload(tab.id);
      this.suspendedTabs.delete(tab.id.toString());
    }

    await this.saveSuspendedData();
    this.loadTabs();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TabSuspender();
});
