/**
 * Tab Suspender - Popup Script
 * 處理標籤暫停管理的 UI 邏輯
 */

// 狀態
const state = {
  tabs: [],
  settings: {},
  currentTab: 'tabs'
};

// DOM 元素
const elements = {};

// 每個標籤預估節省的記憶體 (MB)
const MEMORY_PER_TAB_MB = 50;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  initEventListeners();
  await loadSettings();
  await loadTabs();
});

/**
 * 初始化 DOM 元素
 */
function initElements() {
  elements.enableToggle = document.getElementById('enableToggle');
  elements.settingsBtn = document.getElementById('settingsBtn');
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.closeSettings = document.getElementById('closeSettings');
  elements.totalTabs = document.getElementById('totalTabs');
  elements.suspendedTabs = document.getElementById('suspendedTabs');
  elements.memorySaved = document.getElementById('memorySaved');
  elements.suspendOthersBtn = document.getElementById('suspendOthersBtn');
  elements.unsuspendAllBtn = document.getElementById('unsuspendAllBtn');
  elements.tabsList = document.getElementById('tabsList');
  elements.whitelistList = document.getElementById('whitelistList');
  elements.whitelistUrl = document.getElementById('whitelistUrl');
  elements.addWhitelistBtn = document.getElementById('addWhitelistBtn');
  elements.emptyWhitelist = document.getElementById('emptyWhitelist');
  elements.tabNavs = document.querySelectorAll('.tab-nav');
  elements.tabContents = document.querySelectorAll('.tab-content');
}

/**
 * 初始化事件監聽
 */
function initEventListeners() {
  // 啟用開關
  elements.enableToggle.addEventListener('change', handleToggleEnabled);

  // 設定
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.closeSettings.addEventListener('click', closeSettings);

  // 快速操作
  elements.suspendOthersBtn.addEventListener('click', handleSuspendOthers);
  elements.unsuspendAllBtn.addEventListener('click', handleUnsuspendAll);

  // 標籤切換
  elements.tabNavs.forEach(nav => {
    nav.addEventListener('click', () => switchTab(nav.dataset.tab));
  });

  // 白名單
  elements.addWhitelistBtn.addEventListener('click', handleAddWhitelist);
  elements.whitelistUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddWhitelist();
  });

  // 設定選項
  document.getElementById('suspendAfterMinutes').addEventListener('change', saveSettingsFromUI);
  document.getElementById('suspendPinned').addEventListener('change', saveSettingsFromUI);
  document.getElementById('suspendAudible').addEventListener('change', saveSettingsFromUI);
  document.getElementById('showNotification').addEventListener('change', saveSettingsFromUI);
  document.getElementById('ignoreFormInput').addEventListener('change', saveSettingsFromUI);
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
  elements.enableToggle.checked = state.settings.enabled;
  document.getElementById('suspendAfterMinutes').value = state.settings.suspendAfterMinutes;
  document.getElementById('suspendPinned').checked = state.settings.suspendPinned;
  document.getElementById('suspendAudible').checked = state.settings.suspendAudible;
  document.getElementById('showNotification').checked = state.settings.showNotification;
  document.getElementById('ignoreFormInput').checked = state.settings.ignoreFormInput;

  renderWhitelist();
}

/**
 * 從 UI 儲存設定
 */
async function saveSettingsFromUI() {
  state.settings.suspendAfterMinutes = parseInt(document.getElementById('suspendAfterMinutes').value);
  state.settings.suspendPinned = document.getElementById('suspendPinned').checked;
  state.settings.suspendAudible = document.getElementById('suspendAudible').checked;
  state.settings.showNotification = document.getElementById('showNotification').checked;
  state.settings.ignoreFormInput = document.getElementById('ignoreFormInput').checked;

  try {
    await sendMessage({ action: 'saveSettings', settings: state.settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * 切換啟用狀態
 */
async function handleToggleEnabled() {
  state.settings.enabled = elements.enableToggle.checked;

  try {
    await sendMessage({ action: 'saveSettings', settings: state.settings });
  } catch (error) {
    console.error('Failed to toggle enabled:', error);
  }
}

/**
 * 載入標籤
 */
async function loadTabs() {
  try {
    const response = await sendMessage({ action: 'getStatus' });
    if (response.success) {
      state.tabs = response.data;
      updateStats();
      renderTabs();
    }
  } catch (error) {
    console.error('Failed to load tabs:', error);
    elements.tabsList.innerHTML = '<div class="loading">載入失敗</div>';
  }
}

/**
 * 更新統計資訊
 */
function updateStats() {
  const total = state.tabs.length;
  const suspended = state.tabs.filter(t => t.suspended).length;
  const memorySaved = suspended * MEMORY_PER_TAB_MB;

  elements.totalTabs.textContent = total;
  elements.suspendedTabs.textContent = suspended;
  elements.memorySaved.textContent = memorySaved >= 1000
    ? `${(memorySaved / 1000).toFixed(1)} GB`
    : `${memorySaved} MB`;
}

/**
 * 渲染標籤列表
 */
function renderTabs() {
  if (state.tabs.length === 0) {
    elements.tabsList.innerHTML = '<div class="loading">沒有標籤</div>';
    return;
  }

  const html = state.tabs.map(tab => {
    const statusClass = tab.suspended ? 'suspended' : (tab.whitelisted ? 'whitelisted' : '');
    const statusText = tab.suspended ? '已暫停' : (tab.whitelisted ? '白名單' : '');
    const activeClass = tab.active ? 'active' : '';
    const suspendedClass = tab.suspended ? 'suspended' : '';

    return `
      <div class="tab-item ${activeClass} ${suspendedClass}" data-tab-id="${tab.id}">
        <img class="tab-favicon" src="${tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"/>'}"
             onerror="this.style.visibility='hidden'">
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(tab.title)}</div>
          <div class="tab-meta">
            ${statusText ? `<span class="tab-status ${statusClass}">${statusText}</span>` : ''}
            ${!tab.suspended && tab.idleMinutes > 0 ? `<span class="tab-idle">閒置 ${formatIdleTime(tab.idleMinutes)}</span>` : ''}
          </div>
        </div>
        <div class="tab-actions">
          ${tab.suspended ? `
            <button class="tab-action-btn restore" title="恢復">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
          ` : tab.canSuspend ? `
            <button class="tab-action-btn suspend" title="暫停">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
          ` : ''}
          ${!tab.whitelisted && tab.url ? `
            <button class="tab-action-btn whitelist" title="加入白名單">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  elements.tabsList.innerHTML = html;
  attachTabEventListeners();
}

/**
 * 附加標籤事件監聽
 */
function attachTabEventListeners() {
  // 點擊標籤切換
  elements.tabsList.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      if (e.target.closest('.tab-actions')) return;
      const tabId = parseInt(item.dataset.tabId);
      await chrome.tabs.update(tabId, { active: true });
    });
  });

  // 暫停按鈕
  elements.tabsList.querySelectorAll('.tab-action-btn.suspend').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tabId = parseInt(e.target.closest('.tab-item').dataset.tabId);
      await handleSuspendTab(tabId);
    });
  });

  // 恢復按鈕
  elements.tabsList.querySelectorAll('.tab-action-btn.restore').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tabId = parseInt(e.target.closest('.tab-item').dataset.tabId);
      await handleUnsuspendTab(tabId);
    });
  });

  // 白名單按鈕
  elements.tabsList.querySelectorAll('.tab-action-btn.whitelist').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tabId = parseInt(e.target.closest('.tab-item').dataset.tabId);
      const tab = state.tabs.find(t => t.id === tabId);
      if (tab && tab.url) {
        await handleAddToWhitelist(tab.url);
      }
    });
  });
}

/**
 * 暫停標籤
 */
async function handleSuspendTab(tabId) {
  try {
    await sendMessage({ action: 'suspendTab', tabId });
    await loadTabs();
  } catch (error) {
    console.error('Failed to suspend tab:', error);
  }
}

/**
 * 恢復標籤
 */
async function handleUnsuspendTab(tabId) {
  try {
    await sendMessage({ action: 'unsuspendTab', tabId });
    await loadTabs();
  } catch (error) {
    console.error('Failed to unsuspend tab:', error);
  }
}

/**
 * 暫停其他標籤
 */
async function handleSuspendOthers() {
  try {
    elements.suspendOthersBtn.disabled = true;
    await sendMessage({ action: 'suspendOtherTabs' });
    await loadTabs();
  } catch (error) {
    console.error('Failed to suspend others:', error);
  } finally {
    elements.suspendOthersBtn.disabled = false;
  }
}

/**
 * 恢復所有標籤
 */
async function handleUnsuspendAll() {
  try {
    elements.unsuspendAllBtn.disabled = true;
    await sendMessage({ action: 'unsuspendAllTabs' });
    await loadTabs();
  } catch (error) {
    console.error('Failed to unsuspend all:', error);
  } finally {
    elements.unsuspendAllBtn.disabled = false;
  }
}

/**
 * 渲染白名單
 */
function renderWhitelist() {
  const whitelist = state.settings.whitelist || [];

  if (whitelist.length === 0) {
    elements.whitelistList.innerHTML = '';
    elements.emptyWhitelist.classList.remove('hidden');
    return;
  }

  elements.emptyWhitelist.classList.add('hidden');

  const html = whitelist.map(domain => `
    <div class="whitelist-item" data-domain="${escapeHtml(domain)}">
      <span class="whitelist-domain">${escapeHtml(domain)}</span>
      <button class="whitelist-remove" title="移除">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  `).join('');

  elements.whitelistList.innerHTML = html;

  // 移除按鈕事件
  elements.whitelistList.querySelectorAll('.whitelist-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const domain = btn.closest('.whitelist-item').dataset.domain;
      await handleRemoveFromWhitelist(domain);
    });
  });
}

/**
 * 新增白名單
 */
async function handleAddWhitelist() {
  const url = elements.whitelistUrl.value.trim();
  if (!url) return;

  // 處理輸入，支援完整 URL 或純網域
  let domain = url;
  try {
    if (url.includes('://')) {
      domain = new URL(url).hostname;
    }
  } catch {
    // 如果無法解析，直接使用輸入值
  }

  if (!state.settings.whitelist.includes(domain)) {
    state.settings.whitelist.push(domain);
    await sendMessage({ action: 'saveSettings', settings: state.settings });
    renderWhitelist();
    await loadTabs();
  }

  elements.whitelistUrl.value = '';
}

/**
 * 加入白名單 (從標籤)
 */
async function handleAddToWhitelist(url) {
  try {
    await sendMessage({ action: 'addToWhitelist', url });
    await loadSettings();
    await loadTabs();
  } catch (error) {
    console.error('Failed to add to whitelist:', error);
  }
}

/**
 * 從白名單移除
 */
async function handleRemoveFromWhitelist(domain) {
  state.settings.whitelist = state.settings.whitelist.filter(d => d !== domain);
  await sendMessage({ action: 'saveSettings', settings: state.settings });
  renderWhitelist();
  await loadTabs();
}

/**
 * 切換標籤頁
 */
function switchTab(tabName) {
  state.currentTab = tabName;

  elements.tabNavs.forEach(nav => {
    nav.classList.toggle('active', nav.dataset.tab === tabName);
  });

  elements.tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}Tab`);
  });
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
 * 格式化閒置時間
 */
function formatIdleTime(minutes) {
  if (minutes < 60) {
    return `${minutes} 分鐘`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} 小時`;
  }
  return `${hours} 小時 ${mins} 分鐘`;
}
