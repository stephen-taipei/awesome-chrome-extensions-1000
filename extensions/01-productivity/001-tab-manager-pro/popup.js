/**
 * Tab Manager Pro - Popup Script
 * 處理標籤管理的 UI 邏輯
 */

// 狀態管理
const state = {
  tabs: [],
  filteredTabs: [],
  selectedIndex: -1,
  settings: {
    sortOrder: 'default',
    showFavicons: true,
    closeOnSwitch: false,
    searchInUrl: true,
    searchInTitle: true
  },
  searchQuery: '',
  currentSort: 'default'
};

// DOM 元素
const elements = {
  searchInput: null,
  clearSearch: null,
  tabList: null,
  tabCount: null,
  sortBtn: null,
  sortMenu: null,
  closeOthersBtn: null,
  settingsBtn: null,
  settingsPanel: null,
  closeSettings: null,
  emptyState: null
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  initEventListeners();
  await loadSettings();
  await loadTabs();
});

/**
 * 初始化 DOM 元素參照
 */
function initElements() {
  elements.searchInput = document.getElementById('searchInput');
  elements.clearSearch = document.getElementById('clearSearch');
  elements.tabList = document.getElementById('tabList');
  elements.tabCount = document.getElementById('tabCount');
  elements.sortBtn = document.getElementById('sortBtn');
  elements.sortMenu = document.getElementById('sortMenu');
  elements.closeOthersBtn = document.getElementById('closeOthersBtn');
  elements.settingsBtn = document.getElementById('settingsBtn');
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.closeSettings = document.getElementById('closeSettings');
  elements.emptyState = document.getElementById('emptyState');
}

/**
 * 初始化事件監聽
 */
function initEventListeners() {
  // 搜尋
  elements.searchInput.addEventListener('input', handleSearch);
  elements.clearSearch.addEventListener('click', clearSearch);

  // 排序
  elements.sortBtn.addEventListener('click', toggleSortMenu);
  elements.sortMenu.addEventListener('click', handleSort);

  // 關閉其他標籤
  elements.closeOthersBtn.addEventListener('click', closeOtherTabs);

  // 設定
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.closeSettings.addEventListener('click', closeSettingsPanel);

  // 設定選項
  document.getElementById('showFavicons').addEventListener('change', saveSettingsFromUI);
  document.getElementById('closeOnSwitch').addEventListener('change', saveSettingsFromUI);
  document.getElementById('searchInUrl').addEventListener('change', saveSettingsFromUI);
  document.getElementById('searchInTitle').addEventListener('change', saveSettingsFromUI);

  // 鍵盤導航
  document.addEventListener('keydown', handleKeyboard);

  // 點擊外部關閉選單
  document.addEventListener('click', (e) => {
    if (!elements.sortBtn.contains(e.target) && !elements.sortMenu.contains(e.target)) {
      elements.sortMenu.classList.add('hidden');
    }
  });
}

/**
 * 載入設定
 */
async function loadSettings() {
  try {
    const response = await sendMessage({ action: 'getSettings' });
    if (response.success) {
      state.settings = response.data;
      updateSettingsUI();
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

/**
 * 更新設定 UI
 */
function updateSettingsUI() {
  document.getElementById('showFavicons').checked = state.settings.showFavicons;
  document.getElementById('closeOnSwitch').checked = state.settings.closeOnSwitch;
  document.getElementById('searchInUrl').checked = state.settings.searchInUrl;
  document.getElementById('searchInTitle').checked = state.settings.searchInTitle;
}

/**
 * 從 UI 儲存設定
 */
async function saveSettingsFromUI() {
  state.settings.showFavicons = document.getElementById('showFavicons').checked;
  state.settings.closeOnSwitch = document.getElementById('closeOnSwitch').checked;
  state.settings.searchInUrl = document.getElementById('searchInUrl').checked;
  state.settings.searchInTitle = document.getElementById('searchInTitle').checked;

  try {
    await sendMessage({ action: 'saveSettings', settings: state.settings });
    renderTabs();
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * 載入所有標籤
 */
async function loadTabs() {
  try {
    const response = await sendMessage({ action: 'getTabs' });
    if (response.success) {
      state.tabs = response.data;
      state.filteredTabs = flattenTabs(state.tabs);
      updateTabCount();
      renderTabs();
    }
  } catch (error) {
    console.error('Failed to load tabs:', error);
    elements.tabList.innerHTML = '<div class="loading">載入失敗</div>';
  }
}

/**
 * 扁平化標籤列表
 */
function flattenTabs(windows) {
  const tabs = [];
  for (const win of windows) {
    for (const tab of win.tabs) {
      tabs.push({ ...tab, windowFocused: win.focused });
    }
  }
  return tabs;
}

/**
 * 更新標籤數量顯示
 */
function updateTabCount() {
  const count = state.filteredTabs.length;
  elements.tabCount.textContent = count;
}

/**
 * 渲染標籤列表
 */
function renderTabs() {
  const tabs = getFilteredAndSortedTabs();

  if (tabs.length === 0) {
    elements.tabList.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');

  // 依視窗分組
  const windowGroups = groupByWindow(tabs);
  let html = '';

  for (const [windowId, windowTabs] of Object.entries(windowGroups)) {
    const isFocused = windowTabs[0]?.windowFocused;
    html += `
      <div class="window-group" data-window-id="${windowId}">
        <div class="window-header">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path fill="currentColor" d="M7 10l5 5 5-5z"/>
          </svg>
          <span>視窗 ${isFocused ? '(當前)' : ''}</span>
          <span>${windowTabs.length} 個標籤</span>
        </div>
        <div class="window-tabs">
          ${windowTabs.map((tab, index) => renderTabItem(tab, index)).join('')}
        </div>
      </div>
    `;
  }

  elements.tabList.innerHTML = html;
  attachTabEventListeners();
}

/**
 * 依視窗分組
 */
function groupByWindow(tabs) {
  const groups = {};
  for (const tab of tabs) {
    if (!groups[tab.windowId]) {
      groups[tab.windowId] = [];
    }
    groups[tab.windowId].push(tab);
  }
  return groups;
}

/**
 * 渲染單一標籤項目
 */
function renderTabItem(tab, index) {
  const isSelected = index === state.selectedIndex;
  const classes = [
    'tab-item',
    tab.active ? 'active' : '',
    tab.pinned ? 'pinned' : '',
    isSelected ? 'selected' : ''
  ].filter(Boolean).join(' ');

  const favicon = state.settings.showFavicons && tab.favIconUrl
    ? `<img class="tab-favicon" src="${escapeHtml(tab.favIconUrl)}" alt="" onerror="this.outerHTML='<div class=\\'tab-favicon default\\'><svg viewBox=\\'0 0 24 24\\'><path fill=\\'currentColor\\' d=\\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z\\'/></svg></div>'"/>`
    : '<div class="tab-favicon default"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>';

  const title = highlightMatch(escapeHtml(tab.title || 'New Tab'), state.searchQuery);
  const url = highlightMatch(escapeHtml(getDomain(tab.url)), state.searchQuery);

  let indicators = '';
  if (tab.audible && !tab.mutedInfo?.muted) {
    indicators += `<svg class="indicator audible" viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  }
  if (tab.mutedInfo?.muted) {
    indicators += `<svg class="indicator muted" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  }

  return `
    <div class="tab-item ${classes}" data-tab-id="${tab.id}" data-window-id="${tab.windowId}" tabindex="0" draggable="true">
      ${favicon}
      <div class="tab-info">
        <div class="tab-title">${title}</div>
        <div class="tab-url">${url}</div>
      </div>
      <div class="tab-indicators">
        ${indicators}
      </div>
      <div class="tab-actions">
        <button class="tab-action-btn pin" title="${tab.pinned ? '取消釘選' : '釘選'}">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
          </svg>
        </button>
        <button class="tab-action-btn close" title="關閉">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * 附加標籤事件監聽
 */
function attachTabEventListeners() {
  const tabItems = elements.tabList.querySelectorAll('.tab-item');

  tabItems.forEach((item) => {
    // 點擊切換標籤
    item.addEventListener('click', (e) => {
      if (e.target.closest('.tab-actions')) return;
      handleTabClick(item);
    });

    // 釘選按鈕
    item.querySelector('.tab-action-btn.pin')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePinTab(item);
    });

    // 關閉按鈕
    item.querySelector('.tab-action-btn.close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCloseTab(item);
    });

    // 拖拽事件
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
  });

  // 視窗標題點擊折疊
  const windowHeaders = elements.tabList.querySelectorAll('.window-header');
  windowHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('collapsed');
    });
  });
}

/**
 * 處理標籤點擊
 */
async function handleTabClick(item) {
  const tabId = parseInt(item.dataset.tabId);
  const windowId = parseInt(item.dataset.windowId);

  try {
    await sendMessage({ action: 'switchToTab', tabId, windowId });
    if (state.settings.closeOnSwitch) {
      window.close();
    }
  } catch (error) {
    console.error('Failed to switch tab:', error);
  }
}

/**
 * 處理釘選標籤
 */
async function handlePinTab(item) {
  const tabId = parseInt(item.dataset.tabId);
  const isPinned = item.classList.contains('pinned');

  try {
    await sendMessage({ action: 'pinTab', tabId, pinned: !isPinned });
    await loadTabs();
  } catch (error) {
    console.error('Failed to pin tab:', error);
  }
}

/**
 * 處理關閉標籤
 */
async function handleCloseTab(item) {
  const tabId = parseInt(item.dataset.tabId);

  try {
    item.style.opacity = '0';
    await sendMessage({ action: 'closeTab', tabId });
    await loadTabs();
  } catch (error) {
    console.error('Failed to close tab:', error);
  }
}

/**
 * 關閉其他標籤
 */
async function closeOtherTabs() {
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const otherTabIds = state.filteredTabs
    .filter(tab => tab.id !== currentTab.id && !tab.pinned)
    .map(tab => tab.id);

  if (otherTabIds.length === 0) return;

  if (confirm(`確定要關閉其他 ${otherTabIds.length} 個標籤嗎？`)) {
    try {
      await sendMessage({ action: 'closeTabs', tabIds: otherTabIds });
      await loadTabs();
    } catch (error) {
      console.error('Failed to close other tabs:', error);
    }
  }
}

/**
 * 處理搜尋
 */
function handleSearch() {
  state.searchQuery = elements.searchInput.value.toLowerCase().trim();
  state.selectedIndex = -1;
  filterAndRender();
}

/**
 * 清除搜尋
 */
function clearSearch() {
  elements.searchInput.value = '';
  state.searchQuery = '';
  state.selectedIndex = -1;
  filterAndRender();
  elements.searchInput.focus();
}

/**
 * 過濾並渲染
 */
function filterAndRender() {
  const query = state.searchQuery;

  if (!query) {
    state.filteredTabs = flattenTabs(state.tabs);
  } else {
    state.filteredTabs = flattenTabs(state.tabs).filter(tab => {
      const titleMatch = state.settings.searchInTitle &&
        tab.title?.toLowerCase().includes(query);
      const urlMatch = state.settings.searchInUrl &&
        tab.url?.toLowerCase().includes(query);
      return titleMatch || urlMatch;
    });
  }

  updateTabCount();
  renderTabs();
}

/**
 * 取得過濾和排序後的標籤
 */
function getFilteredAndSortedTabs() {
  let tabs = [...state.filteredTabs];

  switch (state.currentSort) {
    case 'title':
      tabs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'url':
      tabs.sort((a, b) => getDomain(a.url).localeCompare(getDomain(b.url)));
      break;
    case 'recent':
      // 活動標籤優先
      tabs.sort((a, b) => {
        if (a.active) return -1;
        if (b.active) return 1;
        return 0;
      });
      break;
    default:
      // 預設順序 (依視窗和索引)
      tabs.sort((a, b) => {
        if (a.windowId !== b.windowId) return a.windowId - b.windowId;
        return a.index - b.index;
      });
  }

  return tabs;
}

/**
 * 切換排序選單
 */
function toggleSortMenu(e) {
  e.stopPropagation();
  elements.sortMenu.classList.toggle('hidden');

  // 更新選中狀態
  elements.sortMenu.querySelectorAll('.menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.sort === state.currentSort);
  });
}

/**
 * 處理排序
 */
function handleSort(e) {
  const sortType = e.target.dataset.sort;
  if (!sortType) return;

  state.currentSort = sortType;
  elements.sortMenu.classList.add('hidden');
  renderTabs();
}

/**
 * 處理鍵盤導航
 */
function handleKeyboard(e) {
  const tabItems = elements.tabList.querySelectorAll('.tab-item');
  const count = tabItems.length;

  if (count === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      state.selectedIndex = Math.min(state.selectedIndex + 1, count - 1);
      updateSelection(tabItems);
      break;

    case 'ArrowUp':
      e.preventDefault();
      state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
      updateSelection(tabItems);
      break;

    case 'Enter':
      if (state.selectedIndex >= 0) {
        e.preventDefault();
        handleTabClick(tabItems[state.selectedIndex]);
      }
      break;

    case 'Delete':
    case 'Backspace':
      if (state.selectedIndex >= 0 && !elements.searchInput.matches(':focus')) {
        e.preventDefault();
        handleCloseTab(tabItems[state.selectedIndex]);
      }
      break;

    case 'Escape':
      if (!elements.settingsPanel.classList.contains('hidden')) {
        closeSettingsPanel();
      } else if (state.searchQuery) {
        clearSearch();
      } else {
        window.close();
      }
      break;
  }
}

/**
 * 更新選中狀態
 */
function updateSelection(tabItems) {
  tabItems.forEach((item, index) => {
    item.classList.toggle('selected', index === state.selectedIndex);
    if (index === state.selectedIndex) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      item.focus();
    }
  });
}

/**
 * 拖拽開始
 */
function handleDragStart(e) {
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.dataset.tabId);
}

/**
 * 拖拽結束
 */
function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  elements.tabList.querySelectorAll('.tab-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

/**
 * 拖拽經過
 */
function handleDragOver(e) {
  e.preventDefault();
  const dragging = elements.tabList.querySelector('.dragging');
  if (dragging && e.target.closest('.tab-item') !== dragging) {
    const target = e.target.closest('.tab-item');
    if (target) {
      elements.tabList.querySelectorAll('.tab-item').forEach(item => {
        item.classList.remove('drag-over');
      });
      target.classList.add('drag-over');
    }
  }
}

/**
 * 放置
 */
async function handleDrop(e) {
  e.preventDefault();
  const tabId = parseInt(e.dataTransfer.getData('text/plain'));
  const target = e.target.closest('.tab-item');

  if (!target || target.dataset.tabId === String(tabId)) return;

  const targetTabId = parseInt(target.dataset.tabId);
  const targetWindowId = parseInt(target.dataset.windowId);

  // 找到目標標籤的索引
  const targetTab = state.filteredTabs.find(t => t.id === targetTabId);
  if (!targetTab) return;

  try {
    await sendMessage({
      action: 'moveTab',
      tabId,
      windowId: targetWindowId,
      index: targetTab.index
    });
    await loadTabs();
  } catch (error) {
    console.error('Failed to move tab:', error);
  }
}

/**
 * 開啟設定
 */
function openSettings() {
  elements.settingsPanel.classList.remove('hidden');
}

/**
 * 關閉設定面板
 */
function closeSettingsPanel() {
  elements.settingsPanel.classList.add('hidden');
}

/**
 * 發送訊息到背景腳本
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * 工具函式：取得網域
 */
function getDomain(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * 工具函式：HTML 跳脫
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 工具函式：高亮搜尋匹配
 */
function highlightMatch(text, query) {
  if (!query) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * 工具函式：跳脫正則表達式特殊字元
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
