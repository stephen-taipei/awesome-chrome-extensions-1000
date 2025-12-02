/**
 * Tab Groups Plus - Popup Script
 * 處理群組管理的 UI 邏輯
 */

// 狀態
const state = {
  groups: [],
  ungroupedTabs: [],
  templates: [],
  settings: {},
  selectedColor: 'blue',
  currentTab: 'groups'
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
  elements.autoGroupBtn = document.getElementById('autoGroupBtn');
  elements.collapseAllBtn = document.getElementById('collapseAllBtn');
  elements.expandAllBtn = document.getElementById('expandAllBtn');
  elements.settingsBtn = document.getElementById('settingsBtn');
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.closeSettings = document.getElementById('closeSettings');
  elements.groupsList = document.getElementById('groupsList');
  elements.ungroupedList = document.getElementById('ungroupedList');
  elements.templatesList = document.getElementById('templatesList');
  elements.emptyGroups = document.getElementById('emptyGroups');
  elements.emptyUngrouped = document.getElementById('emptyUngrouped');
  elements.emptyTemplates = document.getElementById('emptyTemplates');
  elements.createGroupDialog = document.getElementById('createGroupDialog');
  elements.saveTemplateDialog = document.getElementById('saveTemplateDialog');
  elements.tabNavs = document.querySelectorAll('.tab-nav');
  elements.tabContents = document.querySelectorAll('.tab-content');
}

/**
 * 初始化事件監聽
 */
function initEventListeners() {
  // 快速操作
  elements.autoGroupBtn.addEventListener('click', handleAutoGroup);
  elements.collapseAllBtn.addEventListener('click', () => handleCollapseAll(true));
  elements.expandAllBtn.addEventListener('click', () => handleCollapseAll(false));

  // 設定
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.closeSettings.addEventListener('click', closeSettings);

  // 標籤切換
  elements.tabNavs.forEach(nav => {
    nav.addEventListener('click', () => switchTab(nav.dataset.tab));
  });

  // 建立群組對話框
  document.getElementById('createFirstGroup').addEventListener('click', showCreateGroupDialog);
  document.getElementById('cancelCreateGroup').addEventListener('click', hideCreateGroupDialog);
  document.getElementById('confirmCreateGroup').addEventListener('click', handleCreateGroup);

  // 儲存範本對話框
  document.getElementById('saveCurrentTemplate').addEventListener('click', showSaveTemplateDialog);
  document.getElementById('cancelSaveTemplate').addEventListener('click', hideSaveTemplateDialog);
  document.getElementById('confirmSaveTemplate').addEventListener('click', handleSaveTemplate);

  // 顏色選擇器
  document.querySelectorAll('.color-picker .color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const picker = e.target.closest('.color-picker');
      picker.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
      state.selectedColor = e.target.dataset.color;
    });
  });

  // 設定選項
  document.getElementById('autoGroupEnabled').addEventListener('change', saveSettingsFromUI);
  document.getElementById('autoGroupOnNewTab').addEventListener('change', saveSettingsFromUI);
  document.getElementById('collapseOnCreate').addEventListener('change', saveSettingsFromUI);

  document.getElementById('colorPicker').addEventListener('click', (e) => {
    if (e.target.classList.contains('color-btn')) {
      document.querySelectorAll('#colorPicker .color-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
      state.settings.defaultColor = e.target.dataset.color;
      saveSettingsFromUI();
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
  document.getElementById('autoGroupEnabled').checked = state.settings.autoGroupEnabled;
  document.getElementById('autoGroupOnNewTab').checked = state.settings.autoGroupOnNewTab;
  document.getElementById('collapseOnCreate').checked = state.settings.collapseOnCreate;

  // 預設顏色
  document.querySelectorAll('#colorPicker .color-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.color === state.settings.defaultColor);
  });
}

/**
 * 從 UI 儲存設定
 */
async function saveSettingsFromUI() {
  state.settings.autoGroupEnabled = document.getElementById('autoGroupEnabled').checked;
  state.settings.autoGroupOnNewTab = document.getElementById('autoGroupOnNewTab').checked;
  state.settings.collapseOnCreate = document.getElementById('collapseOnCreate').checked;

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
  await Promise.all([
    loadGroups(),
    loadUngroupedTabs(),
    loadTemplates()
  ]);
}

/**
 * 載入群組
 */
async function loadGroups() {
  try {
    const response = await sendMessage({ action: 'getGroups' });
    if (response.success) {
      state.groups = response.data;
      renderGroups();
    }
  } catch (error) {
    console.error('Failed to load groups:', error);
    elements.groupsList.innerHTML = '<div class="loading">載入失敗</div>';
  }
}

/**
 * 載入未分組標籤
 */
async function loadUngroupedTabs() {
  try {
    const response = await sendMessage({ action: 'getUngroupedTabs' });
    if (response.success) {
      state.ungroupedTabs = response.data;
      renderUngroupedTabs();
    }
  } catch (error) {
    console.error('Failed to load ungrouped tabs:', error);
  }
}

/**
 * 載入範本
 */
async function loadTemplates() {
  try {
    const response = await sendMessage({ action: 'getTemplates' });
    if (response.success) {
      state.templates = response.data;
      renderTemplates();
    }
  } catch (error) {
    console.error('Failed to load templates:', error);
  }
}

/**
 * 渲染群組列表
 */
function renderGroups() {
  if (state.groups.length === 0) {
    elements.groupsList.innerHTML = '';
    elements.emptyGroups.classList.remove('hidden');
    return;
  }

  elements.emptyGroups.classList.add('hidden');

  const html = state.groups.map(group => `
    <div class="group-item" data-group-id="${group.id}">
      <div class="group-header">
        <svg class="collapse-icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
        <div class="group-color ${group.color}"></div>
        <span class="group-title">${escapeHtml(group.title) || '未命名群組'}</span>
        <span class="group-count">${group.tabs.length}</span>
        <div class="group-actions">
          <button class="group-action-btn edit-group" title="編輯">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="group-action-btn ungroup" title="解散群組">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29 4.71 4.7V20h2v-8.41l-5.29-5.3z"/>
            </svg>
          </button>
          <button class="group-action-btn danger delete-group" title="刪除群組">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="group-tabs">
        ${group.tabs.map(tab => `
          <div class="group-tab" data-tab-id="${tab.id}">
            <img class="tab-favicon" src="${tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"/>'}"
                 onerror="this.style.visibility='hidden'">
            <span class="tab-title">${escapeHtml(tab.title)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  elements.groupsList.innerHTML = html;
  attachGroupEventListeners();
}

/**
 * 附加群組事件監聽
 */
function attachGroupEventListeners() {
  // 群組標題點擊收合
  elements.groupsList.querySelectorAll('.group-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.group-actions')) return;
      header.closest('.group-item').classList.toggle('collapsed');
    });
  });

  // 標籤點擊切換
  elements.groupsList.querySelectorAll('.group-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const tabId = parseInt(tab.dataset.tabId);
      await chrome.tabs.update(tabId, { active: true });
    });
  });

  // 編輯群組
  elements.groupsList.querySelectorAll('.edit-group').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const groupId = parseInt(e.target.closest('.group-item').dataset.groupId);
      showEditGroupDialog(groupId);
    });
  });

  // 解散群組
  elements.groupsList.querySelectorAll('.ungroup').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const groupId = parseInt(e.target.closest('.group-item').dataset.groupId);
      await handleUngroup(groupId);
    });
  });

  // 刪除群組
  elements.groupsList.querySelectorAll('.delete-group').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const groupId = parseInt(e.target.closest('.group-item').dataset.groupId);
      if (confirm('確定要刪除此群組嗎？所有標籤將被關閉。')) {
        await handleDeleteGroup(groupId);
      }
    });
  });
}

/**
 * 渲染未分組標籤
 */
function renderUngroupedTabs() {
  if (state.ungroupedTabs.length === 0) {
    elements.ungroupedList.innerHTML = '';
    elements.emptyUngrouped.classList.remove('hidden');
    return;
  }

  elements.emptyUngrouped.classList.add('hidden');

  const html = state.ungroupedTabs.map(tab => `
    <div class="ungrouped-tab" data-tab-id="${tab.id}">
      <img class="tab-favicon" src="${tab.favIconUrl || 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"/>'}"
           onerror="this.style.visibility='hidden'">
      <span class="tab-title">${escapeHtml(tab.title)}</span>
      <div class="tab-actions">
        <button class="group-action-btn add-to-group" title="加入群組">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  elements.ungroupedList.innerHTML = html;

  // 點擊切換到標籤
  elements.ungroupedList.querySelectorAll('.ungrouped-tab').forEach(item => {
    item.addEventListener('click', async (e) => {
      if (e.target.closest('.tab-actions')) return;
      const tabId = parseInt(item.dataset.tabId);
      await chrome.tabs.update(tabId, { active: true });
    });
  });

  // 加入群組
  elements.ungroupedList.querySelectorAll('.add-to-group').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tabId = parseInt(e.target.closest('.ungrouped-tab').dataset.tabId);
      showAddToGroupMenu(tabId, e.target);
    });
  });
}

/**
 * 渲染範本列表
 */
function renderTemplates() {
  if (state.templates.length === 0) {
    elements.templatesList.innerHTML = '';
    elements.emptyTemplates.classList.remove('hidden');
    return;
  }

  elements.emptyTemplates.classList.add('hidden');

  const html = state.templates.map(template => `
    <div class="template-item" data-template-id="${template.id}">
      <div class="template-info">
        <h4>${escapeHtml(template.name)}</h4>
        <p>${template.groups?.length || 0} 個群組</p>
      </div>
      <div class="template-actions">
        <button class="action-btn apply-template">套用</button>
        <button class="group-action-btn danger delete-template" title="刪除">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  elements.templatesList.innerHTML = html;

  // 套用範本
  elements.templatesList.querySelectorAll('.apply-template').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const templateId = e.target.closest('.template-item').dataset.templateId;
      await handleApplyTemplate(templateId);
    });
  });

  // 刪除範本
  elements.templatesList.querySelectorAll('.delete-template').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const templateId = e.target.closest('.template-item').dataset.templateId;
      if (confirm('確定要刪除此範本嗎？')) {
        await handleDeleteTemplate(templateId);
      }
    });
  });
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
 * 自動分組
 */
async function handleAutoGroup() {
  try {
    elements.autoGroupBtn.disabled = true;
    elements.autoGroupBtn.innerHTML = '<span>分組中...</span>';

    const response = await sendMessage({ action: 'autoGroupByDomain' });

    if (response.success) {
      await loadData();
    }
  } catch (error) {
    console.error('Failed to auto group:', error);
  } finally {
    elements.autoGroupBtn.disabled = false;
    elements.autoGroupBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M3 5v14h18V5H3zm4 2v2H5V7h2zm-2 6v-2h2v2H5zm0 2h2v2H5v-2zm14 2H9v-2h10v2zm0-4H9v-2h10v2zm0-4H9V7h10v2z"/>
      </svg>
      <span>自動分組</span>
    `;
  }
}

/**
 * 收合/展開所有群組
 */
async function handleCollapseAll(collapsed) {
  try {
    await sendMessage({ action: 'collapseAll', collapsed });
    await loadGroups();
  } catch (error) {
    console.error('Failed to collapse groups:', error);
  }
}

/**
 * 解散群組
 */
async function handleUngroup(groupId) {
  try {
    await sendMessage({ action: 'ungroup', groupId });
    await loadData();
  } catch (error) {
    console.error('Failed to ungroup:', error);
  }
}

/**
 * 刪除群組
 */
async function handleDeleteGroup(groupId) {
  try {
    await sendMessage({ action: 'deleteGroup', groupId });
    await loadData();
  } catch (error) {
    console.error('Failed to delete group:', error);
  }
}

/**
 * 套用範本
 */
async function handleApplyTemplate(templateId) {
  try {
    await sendMessage({ action: 'applyTemplate', templateId });
    await loadData();
  } catch (error) {
    console.error('Failed to apply template:', error);
  }
}

/**
 * 刪除範本
 */
async function handleDeleteTemplate(templateId) {
  try {
    await sendMessage({ action: 'deleteTemplate', templateId });
    await loadTemplates();
  } catch (error) {
    console.error('Failed to delete template:', error);
  }
}

/**
 * 顯示建立群組對話框
 */
function showCreateGroupDialog() {
  elements.createGroupDialog.classList.remove('hidden');
  document.getElementById('newGroupTitle').focus();
}

/**
 * 隱藏建立群組對話框
 */
function hideCreateGroupDialog() {
  elements.createGroupDialog.classList.add('hidden');
  document.getElementById('newGroupTitle').value = '';
}

/**
 * 建立群組
 */
async function handleCreateGroup() {
  const title = document.getElementById('newGroupTitle').value.trim();

  if (state.ungroupedTabs.length === 0) {
    alert('沒有可分組的標籤');
    return;
  }

  try {
    const tabIds = state.ungroupedTabs.map(t => t.id);
    await sendMessage({
      action: 'createGroup',
      tabIds,
      title,
      color: state.selectedColor
    });
    hideCreateGroupDialog();
    await loadData();
  } catch (error) {
    console.error('Failed to create group:', error);
  }
}

/**
 * 顯示編輯群組對話框
 */
function showEditGroupDialog(groupId) {
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return;

  // 簡單的 prompt 編輯
  const newTitle = prompt('群組名稱', group.title);
  if (newTitle !== null) {
    handleUpdateGroup(groupId, { title: newTitle });
  }
}

/**
 * 更新群組
 */
async function handleUpdateGroup(groupId, options) {
  try {
    await sendMessage({ action: 'updateGroup', groupId, options });
    await loadGroups();
  } catch (error) {
    console.error('Failed to update group:', error);
  }
}

/**
 * 顯示加入群組選單
 */
function showAddToGroupMenu(tabId, target) {
  // 簡單實作：使用 prompt 選擇群組
  if (state.groups.length === 0) {
    alert('請先建立群組');
    return;
  }

  const groupNames = state.groups.map((g, i) => `${i + 1}. ${g.title || '未命名群組'}`).join('\n');
  const choice = prompt(`選擇群組 (輸入數字):\n${groupNames}`);

  if (choice) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < state.groups.length) {
      handleMoveTabToGroup(tabId, state.groups[index].id);
    }
  }
}

/**
 * 移動標籤到群組
 */
async function handleMoveTabToGroup(tabId, groupId) {
  try {
    await sendMessage({ action: 'moveTabToGroup', tabId, groupId });
    await loadData();
  } catch (error) {
    console.error('Failed to move tab:', error);
  }
}

/**
 * 顯示儲存範本對話框
 */
function showSaveTemplateDialog() {
  elements.saveTemplateDialog.classList.remove('hidden');
  document.getElementById('templateName').focus();
}

/**
 * 隱藏儲存範本對話框
 */
function hideSaveTemplateDialog() {
  elements.saveTemplateDialog.classList.add('hidden');
  document.getElementById('templateName').value = '';
}

/**
 * 儲存範本
 */
async function handleSaveTemplate() {
  const name = document.getElementById('templateName').value.trim();
  if (!name) {
    alert('請輸入範本名稱');
    return;
  }

  try {
    // 建立範本資料
    const template = {
      name,
      groups: state.groups.map(g => ({
        title: g.title,
        color: g.color,
        domains: [...new Set(g.tabs.map(t => {
          try {
            return new URL(t.url).hostname.replace(/^www\./, '');
          } catch {
            return '';
          }
        }).filter(Boolean))]
      }))
    };

    await sendMessage({ action: 'saveTemplate', template });
    hideSaveTemplateDialog();
    await loadTemplates();
  } catch (error) {
    console.error('Failed to save template:', error);
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
