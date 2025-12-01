/**
 * Tab Manager Pro - Background Service Worker
 * 處理標籤管理的背景邏輯
 */

// 初始化設定
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 設定預設值
    await chrome.storage.local.set({
      settings: {
        sortOrder: 'default',
        showFavicons: true,
        closeOnSwitch: false,
        searchInUrl: true,
        searchInTitle: true
      }
    });
    console.log('Tab Manager Pro installed successfully');
  }
});

// 訊息處理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 驗證訊息來源
  if (sender.id !== chrome.runtime.id) {
    return false;
  }

  handleMessage(message, sendResponse);
  return true; // 保持連線以支援非同步回應
});

/**
 * 處理來自 popup 的訊息
 */
async function handleMessage(message, sendResponse) {
  try {
    switch (message.action) {
      case 'getTabs':
        const tabs = await getAllTabs();
        sendResponse({ success: true, data: tabs });
        break;

      case 'switchToTab':
        await switchToTab(message.tabId, message.windowId);
        sendResponse({ success: true });
        break;

      case 'closeTab':
        await closeTab(message.tabId);
        sendResponse({ success: true });
        break;

      case 'closeTabs':
        await closeTabs(message.tabIds);
        sendResponse({ success: true });
        break;

      case 'moveTab':
        await moveTab(message.tabId, message.windowId, message.index);
        sendResponse({ success: true });
        break;

      case 'pinTab':
        await pinTab(message.tabId, message.pinned);
        sendResponse({ success: true });
        break;

      case 'duplicateTab':
        const newTab = await duplicateTab(message.tabId);
        sendResponse({ success: true, data: newTab });
        break;

      case 'createGroup':
        const groupId = await createGroup(message.tabIds, message.title, message.color);
        sendResponse({ success: true, data: groupId });
        break;

      case 'getSettings':
        const settings = await getSettings();
        sendResponse({ success: true, data: settings });
        break;

      case 'saveSettings':
        await saveSettings(message.settings);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 取得所有視窗的所有標籤
 */
async function getAllTabs() {
  const windows = await chrome.windows.getAll({ populate: true });
  const result = [];

  for (const win of windows) {
    const windowTabs = win.tabs.map(tab => ({
      id: tab.id,
      windowId: tab.windowId,
      index: tab.index,
      title: tab.title || 'New Tab',
      url: tab.url || '',
      favIconUrl: tab.favIconUrl || '',
      pinned: tab.pinned,
      active: tab.active,
      audible: tab.audible,
      mutedInfo: tab.mutedInfo,
      groupId: tab.groupId,
      discarded: tab.discarded
    }));

    result.push({
      windowId: win.id,
      focused: win.focused,
      type: win.type,
      tabs: windowTabs
    });
  }

  return result;
}

/**
 * 切換到指定標籤
 */
async function switchToTab(tabId, windowId) {
  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(windowId, { focused: true });
}

/**
 * 關閉單一標籤
 */
async function closeTab(tabId) {
  await chrome.tabs.remove(tabId);
}

/**
 * 批次關閉標籤
 */
async function closeTabs(tabIds) {
  await chrome.tabs.remove(tabIds);
}

/**
 * 移動標籤
 */
async function moveTab(tabId, windowId, index) {
  await chrome.tabs.move(tabId, { windowId, index });
}

/**
 * 釘選/取消釘選標籤
 */
async function pinTab(tabId, pinned) {
  await chrome.tabs.update(tabId, { pinned });
}

/**
 * 複製標籤
 */
async function duplicateTab(tabId) {
  return await chrome.tabs.duplicate(tabId);
}

/**
 * 建立標籤群組
 */
async function createGroup(tabIds, title, color) {
  const groupId = await chrome.tabs.group({ tabIds });
  await chrome.tabGroups.update(groupId, { title, color });
  return groupId;
}

/**
 * 取得設定
 */
async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return result.settings || {
    sortOrder: 'default',
    showFavicons: true,
    closeOnSwitch: false,
    searchInUrl: true,
    searchInTitle: true
  };
}

/**
 * 儲存設定
 */
async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}
