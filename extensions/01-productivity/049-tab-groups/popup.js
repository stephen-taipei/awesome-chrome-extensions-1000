// Tab Groups - Popup Script

class TabGroups {
  constructor() {
    this.selectedColor = 'blue';
    this.selectedTabId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.tabCountEl = document.getElementById('tabCount');
    this.groupList = document.getElementById('groupList');
    this.noGroups = document.getElementById('noGroups');
    this.ungroupedTabs = document.getElementById('ungroupedTabs');
    this.noUngrouped = document.getElementById('noUngrouped');

    // Quick actions
    this.groupByDomainBtn = document.getElementById('groupByDomainBtn');
    this.ungroupAllBtn = document.getElementById('ungroupAllBtn');

    // Modal
    this.createModal = document.getElementById('createModal');
    this.groupName = document.getElementById('groupName');
    this.colorPicker = document.getElementById('colorPicker');
    this.createGroupBtn = document.getElementById('createGroupBtn');
  }

  bindEvents() {
    this.groupByDomainBtn.addEventListener('click', () => this.groupByDomain());
    this.ungroupAllBtn.addEventListener('click', () => this.ungroupAll());

    // Modal
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        document.getElementById(modalId).classList.add('hidden');
      });
    });

    this.createModal.addEventListener('click', (e) => {
      if (e.target === this.createModal) {
        this.createModal.classList.add('hidden');
      }
    });

    // Color picker
    this.colorPicker.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.colorPicker.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedColor = btn.dataset.color;
      });
    });

    this.createGroupBtn.addEventListener('click', () => this.createGroup());
    this.groupName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.createGroup();
    });
  }

  async loadData() {
    // Get all tabs
    const tabs = await chrome.tabs.query({ currentWindow: true });
    this.tabCountEl.textContent = `${tabs.length} 分頁`;

    // Get all groups
    const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });

    // Render groups
    this.renderGroups(groups, tabs);

    // Render ungrouped tabs
    const ungroupedTabs = tabs.filter(tab => tab.groupId === -1);
    this.renderUngroupedTabs(ungroupedTabs);
  }

  getColorHex(color) {
    const colors = {
      grey: '#6b7280',
      blue: '#3b82f6',
      red: '#ef4444',
      yellow: '#eab308',
      green: '#22c55e',
      pink: '#ec4899',
      purple: '#a855f7',
      cyan: '#06b6d4',
      orange: '#f97316'
    };
    return colors[color] || colors.grey;
  }

  renderGroups(groups, tabs) {
    this.groupList.innerHTML = '';

    if (groups.length === 0) {
      this.noGroups.classList.remove('hidden');
      return;
    }

    this.noGroups.classList.add('hidden');

    groups.forEach(group => {
      const groupTabs = tabs.filter(t => t.groupId === group.id);

      const item = document.createElement('div');
      item.className = 'group-item';

      item.innerHTML = `
        <div class="group-color" style="background:${this.getColorHex(group.color)}"></div>
        <span class="group-name">${group.title || '未命名群組'}</span>
        <span class="group-count">${groupTabs.length}</span>
        <div class="group-actions">
          <button class="group-btn collapse" data-id="${group.id}" title="${group.collapsed ? '展開' : '收合'}">
            ${group.collapsed ? '▶' : '▼'}
          </button>
          <button class="group-btn delete" data-id="${group.id}" title="解散群組">✕</button>
        </div>
      `;

      // Toggle collapse
      const collapseBtn = item.querySelector('.collapse');
      collapseBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await chrome.tabGroups.update(group.id, { collapsed: !group.collapsed });
        this.loadData();
      });

      // Delete group
      const deleteBtn = item.querySelector('.delete');
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await chrome.tabs.ungroup(groupTabs.map(t => t.id));
        this.loadData();
      });

      // Click to focus
      item.addEventListener('click', () => {
        if (groupTabs.length > 0) {
          chrome.tabs.update(groupTabs[0].id, { active: true });
        }
      });

      this.groupList.appendChild(item);
    });
  }

  renderUngroupedTabs(tabs) {
    this.ungroupedTabs.innerHTML = '';

    if (tabs.length === 0) {
      this.noUngrouped.classList.remove('hidden');
      return;
    }

    this.noUngrouped.classList.add('hidden');

    tabs.slice(0, 10).forEach(tab => {
      const item = document.createElement('div');
      item.className = 'tab-item';

      item.innerHTML = `
        <div class="tab-favicon">
          ${tab.favIconUrl ? `<img src="${tab.favIconUrl}" onerror="this.parentElement.textContent='🔗'">` : '🔗'}
        </div>
        <span class="tab-title">${this.escapeHtml(tab.title)}</span>
        <button class="tab-add-btn" data-id="${tab.id}" title="加入群組">+</button>
      `;

      // Add to group
      const addBtn = item.querySelector('.tab-add-btn');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openCreateModal(tab.id);
      });

      // Click to activate
      item.addEventListener('click', () => {
        chrome.tabs.update(tab.id, { active: true });
      });

      this.ungroupedTabs.appendChild(item);
    });

    if (tabs.length > 10) {
      const more = document.createElement('div');
      more.className = 'no-groups';
      more.textContent = `還有 ${tabs.length - 10} 個分頁...`;
      this.ungroupedTabs.appendChild(more);
    }
  }

  openCreateModal(tabId) {
    this.selectedTabId = tabId;
    this.groupName.value = '';
    this.selectedColor = 'blue';
    this.colorPicker.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === 'blue');
    });
    this.createModal.classList.remove('hidden');
    this.groupName.focus();
  }

  async createGroup() {
    const name = this.groupName.value.trim();
    if (!this.selectedTabId) return;

    try {
      const groupId = await chrome.tabs.group({ tabIds: this.selectedTabId });
      await chrome.tabGroups.update(groupId, {
        title: name || undefined,
        color: this.selectedColor
      });

      this.createModal.classList.add('hidden');
      this.loadData();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  }

  async groupByDomain() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const ungroupedTabs = tabs.filter(t => t.groupId === -1);

    // Group by domain
    const domainMap = new Map();
    ungroupedTabs.forEach(tab => {
      try {
        const domain = new URL(tab.url).hostname.replace('www.', '');
        if (!domainMap.has(domain)) {
          domainMap.set(domain, []);
        }
        domainMap.get(domain).push(tab.id);
      } catch {
        // Skip invalid URLs
      }
    });

    // Create groups for domains with multiple tabs
    const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
    let colorIndex = 0;

    for (const [domain, tabIds] of domainMap) {
      if (tabIds.length >= 2) {
        try {
          const groupId = await chrome.tabs.group({ tabIds });
          await chrome.tabGroups.update(groupId, {
            title: domain.split('.')[0],
            color: colors[colorIndex % colors.length]
          });
          colorIndex++;
        } catch (error) {
          console.error('Failed to group:', error);
        }
      }
    }

    this.loadData();
  }

  async ungroupAll() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const groupedTabIds = tabs.filter(t => t.groupId !== -1).map(t => t.id);

    if (groupedTabIds.length > 0) {
      await chrome.tabs.ungroup(groupedTabIds);
    }

    this.loadData();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TabGroups();
});
