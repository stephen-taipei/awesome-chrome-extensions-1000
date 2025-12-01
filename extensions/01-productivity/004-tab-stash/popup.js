/**
 * Tab Stash - Popup Script
 * 標籤暫存管理 UI
 */

// 狀態
const state = {
  stashes: [],
  settings: {},
  currentTabs: []
};

// DOM 元素
const elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  initEventListeners();
  await loadSettings();
  await loadData();
});

/**
 * 初始化 DOM 元素
 */
function initElements() {
  elements.stashName = document.getElementById('stashName');
  elements.stashAllBtn = document.getElementById('stashAllBtn');
  elements.stashList = document.getElementById('stashList');
  elements.emptyState = document.getElementById('emptyState');
  elements.stashCount = document.getElementById('stashCount');
  elements.tabCount = document.getElementById('tabCount');
  elements.currentTabs = document.getElementById('currentTabs');
  elements.settingsBtn = document.getElementById('settingsBtn');
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.closeSettings = document.getElementById('closeSettings');
  elements.exportBtn = document.getElementById('exportBtn');
  elements.importBtn = document.getElementById('importBtn');
  elements.exportDialog = document.getElementById('exportDialog');
  elements.importDialog = document.getElementById('importDialog');
  elements.cleanupBtn = document.getElementById('cleanupBtn');
}

/**
 * 初始化事件監聽
 */
function initEventListeners() {
  // 暫存全部
  elements.stashAllBtn.addEventListener('click', handleStashAll);

  // Enter 鍵暫存
  elements.stashName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleStashAll();
  });

  // 設定
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.closeSettings.addEventListener('click', closeSettings);

  // 匯出/匯入
  elements.exportBtn.addEventListener('click', showExportDialog);
  elements.importBtn.addEventListener('click', showImportDialog);

  document.getElementById('cancelExport').addEventListener('click', hideExportDialog);
  document.getElementById('confirmExport').addEventListener('click', handleExport);
  document.getElementById('cancelImport').addEventListener('click', hideImportDialog);
  document.getElementById('confirmImport').addEventListener('click', handleImport);

  // 設定選項
  document.getElementById('closeAfterStash').addEventListener('change', saveSettingsFromUI);
  document.getElementById('confirmBeforeRestore').addEventListener('change', saveSettingsFromUI);
  document.getElementById('autoCleanupDays').addEventListener('change', saveSettingsFromUI);

  // 清理
  elements.cleanupBtn.addEventListener('click', handleCleanup);
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
  document.getElementById('closeAfterStash').checked = state.settings.closeAfterStash;
  document.getElementById('confirmBeforeRestore').checked = state.settings.confirmBeforeRestore;
  document.getElementById('autoCleanupDays').value = state.settings.autoCleanupDays;
}

/**
 * 從 UI 儲存設定
 */
async function saveSettingsFromUI() {
  state.settings.closeAfterStash = document.getElementById('closeAfterStash').checked;
  state.settings.confirmBeforeRestore = document.getElementById('confirmBeforeRestore').checked;
  state.settings.autoCleanupDays = parseInt(document.getElementById('autoCleanupDays').value);

  try {
    await sendMessage({ action: 'saveSettings', settings: state.settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * 載入資料
 */
async function loadData() {
  await Promise.all([loadStashes(), loadCurrentTabs()]);
}

/**
 * 載入暫存組
 */
async function loadStashes() {
  try {
    const response = await sendMessage({ action: 'getStashes' });
    if (response.success) {
      state.stashes = response.data;
      updateStats();
      renderStashes();
    }
  } catch (error) {
    console.error('Failed to load stashes:', error);
    elements.stashList.innerHTML = '<div class="loading">載入失敗</div>';
  }
}

/**
 * 載入當前標籤
 */
async function loadCurrentTabs() {
  try {
    const response = await sendMessage({ action: 'getCurrentTabs' });
    if (response.success) {
      state.currentTabs = response.data;
      elements.currentTabs.textContent = state.currentTabs.length;
    }
  } catch (error) {
    console.error('Failed to load current tabs:', error);
  }
}

/**
 * 更新統計
 */
function updateStats() {
  elements.stashCount.textContent = state.stashes.length;
  const totalTabs = state.stashes.reduce((sum, s) => sum + s.tabs.length, 0);
  elements.tabCount.textContent = totalTabs;
}

/**
 * 渲染暫存組列表
 */
function renderStashes() {
  if (state.stashes.length === 0) {
    elements.stashList.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');

  const html = state.stashes.map(stash => {
    const date = new Date(stash.createdAt);
    const dateStr = formatDate(date);

    return `
      <div class="stash-item" data-stash-id="${stash.id}">
        <div class="stash-header">
          <svg class="collapse-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M7 10l5 5 5-5z"/>
          </svg>
          <div class="stash-info">
            <div class="stash-name">${escapeHtml(stash.name)}</div>
            <div class="stash-meta">
              <span>${dateStr}</span>
              <span class="stash-count">${stash.tabs.length} 個標籤</span>
            </div>
          </div>
          <div class="stash-actions">
            <button class="stash-action-btn restore" title="恢復全部">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </button>
            <button class="stash-action-btn rename" title="重命名">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="stash-action-btn danger delete" title="刪除">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="stash-tabs">
          ${stash.tabs.map((tab, index) => `
            <div class="stash-tab" data-tab-index="${index}">
              <img class="tab-favicon" src="${tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"/>'}"
                   onerror="this.style.visibility='hidden'">
              <span class="tab-title" title="${escapeHtml(tab.url)}">${escapeHtml(tab.title)}</span>
              <div class="tab-actions">
                <button class="tab-action-btn restore-tab" title="恢復">
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path fill="currentColor" d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                </button>
                <button class="tab-action-btn danger delete-tab" title="刪除">
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  elements.stashList.innerHTML = html;
  attachStashEventListeners();
}

/**
 * 附加暫存組事件監聽
 */
function attachStashEventListeners() {
  // 展開/收合
  elements.stashList.querySelectorAll('.stash-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.stash-actions')) return;
      header.closest('.stash-item').classList.toggle('collapsed');
    });
  });

  // 恢復全部
  elements.stashList.querySelectorAll('.stash-action-btn.restore').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const stashId = e.target.closest('.stash-item').dataset.stashId;
      await handleRestoreStash(stashId);
    });
  });

  // 重命名
  elements.stashList.querySelectorAll('.stash-action-btn.rename').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const stashItem = e.target.closest('.stash-item');
      const stashId = stashItem.dataset.stashId;
      const stash = state.stashes.find(s => s.id === stashId);
      await handleRenameStash(stashId, stash?.name);
    });
  });

  // 刪除
  elements.stashList.querySelectorAll('.stash-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const stashId = e.target.closest('.stash-item').dataset.stashId;
      if (confirm('確定要刪除此暫存組嗎？')) {
        await handleDeleteStash(stashId);
      }
    });
  });

  // 恢復單一標籤
  elements.stashList.querySelectorAll('.tab-action-btn.restore-tab').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const stashItem = e.target.closest('.stash-item');
      const tabItem = e.target.closest('.stash-tab');
      const stashId = stashItem.dataset.stashId;
      const tabIndex = parseInt(tabItem.dataset.tabIndex);
      await handleRestoreTab(stashId, tabIndex);
    });
  });

  // 刪除單一標籤
  elements.stashList.querySelectorAll('.tab-action-btn.delete-tab').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const stashItem = e.target.closest('.stash-item');
      const tabItem = e.target.closest('.stash-tab');
      const stashId = stashItem.dataset.stashId;
      const tabIndex = parseInt(tabItem.dataset.tabIndex);
      await handleDeleteTab(stashId, tabIndex);
    });
  });
}

/**
 * 暫存全部
 */
async function handleStashAll() {
  const name = elements.stashName.value.trim();

  try {
    elements.stashAllBtn.disabled = true;
    await sendMessage({ action: 'stashAllTabs', name });
    elements.stashName.value = '';
    await loadData();
  } catch (error) {
    console.error('Failed to stash tabs:', error);
    alert(error.message || '暫存失敗');
  } finally {
    elements.stashAllBtn.disabled = false;
  }
}

/**
 * 恢復暫存組
 */
async function handleRestoreStash(stashId) {
  if (state.settings.confirmBeforeRestore) {
    const stash = state.stashes.find(s => s.id === stashId);
    if (!confirm(`確定要恢復「${stash?.name}」的 ${stash?.tabs.length} 個標籤嗎？`)) {
      return;
    }
  }

  try {
    await sendMessage({ action: 'restoreStash', stashId, closeAfterRestore: true });
    await loadData();
  } catch (error) {
    console.error('Failed to restore stash:', error);
    alert('恢復失敗');
  }
}

/**
 * 恢復單一標籤
 */
async function handleRestoreTab(stashId, tabIndex) {
  try {
    await sendMessage({ action: 'restoreTab', stashId, tabIndex });
    await loadData();
  } catch (error) {
    console.error('Failed to restore tab:', error);
  }
}

/**
 * 重命名暫存組
 */
async function handleRenameStash(stashId, currentName) {
  const newName = prompt('輸入新名稱', currentName || '');
  if (newName === null || newName === currentName) return;

  try {
    await sendMessage({ action: 'renameStash', stashId, newName });
    await loadStashes();
  } catch (error) {
    console.error('Failed to rename stash:', error);
  }
}

/**
 * 刪除暫存組
 */
async function handleDeleteStash(stashId) {
  try {
    await sendMessage({ action: 'deleteStash', stashId });
    await loadData();
  } catch (error) {
    console.error('Failed to delete stash:', error);
  }
}

/**
 * 刪除標籤
 */
async function handleDeleteTab(stashId, tabIndex) {
  try {
    await sendMessage({ action: 'deleteTab', stashId, tabIndex });
    await loadData();
  } catch (error) {
    console.error('Failed to delete tab:', error);
  }
}

/**
 * 顯示匯出對話框
 */
function showExportDialog() {
  elements.exportDialog.classList.remove('hidden');
}

/**
 * 隱藏匯出對話框
 */
function hideExportDialog() {
  elements.exportDialog.classList.add('hidden');
}

/**
 * 處理匯出
 */
async function handleExport() {
  const format = document.querySelector('input[name="exportFormat"]:checked').value;

  try {
    const response = await sendMessage({ action: 'exportStashes', format });
    if (response.success) {
      // 下載檔案
      const blob = new Blob([response.data], { type: format === 'json' ? 'application/json' : 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tab-stash-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      hideExportDialog();
    }
  } catch (error) {
    console.error('Failed to export:', error);
    alert('匯出失敗');
  }
}

/**
 * 顯示匯入對話框
 */
function showImportDialog() {
  elements.importDialog.classList.remove('hidden');
  document.getElementById('importData').value = '';
}

/**
 * 隱藏匯入對話框
 */
function hideImportDialog() {
  elements.importDialog.classList.add('hidden');
}

/**
 * 處理匯入
 */
async function handleImport() {
  const data = document.getElementById('importData').value.trim();

  if (!data) {
    alert('請輸入資料');
    return;
  }

  try {
    const response = await sendMessage({ action: 'importStashes', data });
    if (response.success) {
      alert(`成功匯入 ${response.data.imported} 個暫存組`);
      hideImportDialog();
      await loadData();
    }
  } catch (error) {
    console.error('Failed to import:', error);
    alert(error.message || '匯入失敗');
  }
}

/**
 * 清理過期暫存
 */
async function handleCleanup() {
  if (!confirm('確定要清理過期的暫存組嗎？')) return;

  try {
    const response = await sendMessage({ action: 'cleanupOldStashes' });
    if (response.success) {
      alert(`已清理 ${response.data.cleaned} 個過期暫存組`);
      await loadData();
    }
  } catch (error) {
    console.error('Failed to cleanup:', error);
  }
}

/**
 * 開啟設定
 */
function openSettings() {
  elements.settingsPanel.classList.remove('hidden');
}

/**
 * 關閉設定
 */
function closeSettings() {
  elements.settingsPanel.classList.add('hidden');
}

/**
 * 發送訊息到 background
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!response.success) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * HTML 跳脫
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 格式化日期
 */
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    return date.toLocaleDateString('zh-TW');
  }
}
