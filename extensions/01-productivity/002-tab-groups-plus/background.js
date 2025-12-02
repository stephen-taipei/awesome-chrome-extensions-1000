/**
 * Tab Groups Plus - Background Service Worker
 * 處理標籤群組管理的背景邏輯
 */

// 群組顏色列表
const GROUP_COLORS = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];

// 預設設定
const DEFAULT_SETTINGS = {
  autoGroupEnabled: false,
  autoGroupOnNewTab: false,
  defaultColor: 'blue',
  groupByDomain: true,
  collapseOnCreate: false,
  templates: []
};

// 初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    console.log('Tab Groups Plus installed successfully');
  }
});

// 監聽快捷鍵
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'auto-group':
      await autoGroupAllTabs();
      break;
    case 'collapse-all':
      await collapseAllGroups(true);
      break;
  }
});

// 監聽新標籤建立（自動分組）
chrome.tabs.onCreated.addListener(async (tab) => {
  const settings = await getSettings();
  if (settings.autoGroupEnabled && settings.autoGroupOnNewTab && tab.url) {
    // 延遲處理，等待 URL 載入完成
    setTimeout(async () => {
      const updatedTab = await chrome.tabs.get(tab.id);
      if (updatedTab.url && !updatedTab.url.startsWith('chrome://')) {
        await autoGroupTab(updatedTab);
      }
    }, 1000);
  }
});

// 監聽標籤 URL 變更
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const settings = await getSettings();
    if (settings.autoGroupEnabled && !changeInfo.url.startsWith('chrome://')) {
      await autoGroupTab(tab);
    }
  }
});

// 訊息處理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;
  handleMessage(message, sendResponse);
  return true;
});

/**
 * 處理來自 popup 的訊息
 */
async function handleMessage(message, sendResponse) {
  try {
    switch (message.action) {
      case 'getGroups':
        const groups = await getAllGroups();
        sendResponse({ success: true, data: groups });
        break;

      case 'getUngroupedTabs':
        const ungrouped = await getUngroupedTabs();
        sendResponse({ success: true, data: ungrouped });
        break;

      case 'createGroup':
        const groupId = await createGroup(message.tabIds, message.title, message.color);
        sendResponse({ success: true, data: groupId });
        break;

      case 'updateGroup':
        await updateGroup(message.groupId, message.options);
        sendResponse({ success: true });
        break;

      case 'ungroup':
        await ungroupTabs(message.groupId);
        sendResponse({ success: true });
        break;

      case 'deleteGroup':
        await deleteGroup(message.groupId);
        sendResponse({ success: true });
        break;

      case 'collapseAll':
        await collapseAllGroups(message.collapsed);
        sendResponse({ success: true });
        break;

      case 'autoGroupAll':
        const result = await autoGroupAllTabs();
        sendResponse({ success: true, data: result });
        break;

      case 'autoGroupByDomain':
        const domainResult = await autoGroupByDomain();
        sendResponse({ success: true, data: domainResult });
        break;

      case 'moveTabToGroup':
        await moveTabToGroup(message.tabId, message.groupId);
        sendResponse({ success: true });
        break;

      case 'saveTemplate':
        await saveTemplate(message.template);
        sendResponse({ success: true });
        break;

      case 'applyTemplate':
        await applyTemplate(message.templateId);
        sendResponse({ success: true });
        break;

      case 'deleteTemplate':
        await deleteTemplate(message.templateId);
        sendResponse({ success: true });
        break;

      case 'getTemplates':
        const templates = await getTemplates();
        sendResponse({ success: true, data: templates });
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
 * 取得所有群組及其標籤
 */
async function getAllGroups() {
  const [groups, tabs] = await Promise.all([
    chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }),
    chrome.tabs.query({ currentWindow: true })
  ]);

  return groups.map(group => ({
    id: group.id,
    title: group.title || '',
    color: group.color,
    collapsed: group.collapsed,
    tabs: tabs.filter(tab => tab.groupId === group.id).map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl
    }))
  }));
}

/**
 * 取得未分組的標籤
 */
async function getUngroupedTabs() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
  });

  return tabs.map(tab => ({
    id: tab.id,
    title: tab.title,
    url: tab.url,
    favIconUrl: tab.favIconUrl
  }));
}

/**
 * 建立新群組
 */
async function createGroup(tabIds, title, color) {
  const settings = await getSettings();
  const groupId = await chrome.tabs.group({ tabIds });

  await chrome.tabGroups.update(groupId, {
    title: title || '',
    color: color || settings.defaultColor,
    collapsed: settings.collapseOnCreate
  });

  return groupId;
}

/**
 * 更新群組
 */
async function updateGroup(groupId, options) {
  await chrome.tabGroups.update(groupId, options);
}

/**
 * 解散群組
 */
async function ungroupTabs(groupId) {
  const tabs = await chrome.tabs.query({ groupId });
  const tabIds = tabs.map(t => t.id);
  await chrome.tabs.ungroup(tabIds);
}

/**
 * 刪除群組（關閉所有標籤）
 */
async function deleteGroup(groupId) {
  const tabs = await chrome.tabs.query({ groupId });
  const tabIds = tabs.map(t => t.id);
  await chrome.tabs.remove(tabIds);
}

/**
 * 收合/展開所有群組
 */
async function collapseAllGroups(collapsed) {
  const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });

  for (const group of groups) {
    await chrome.tabGroups.update(group.id, { collapsed });
  }
}

/**
 * 自動分組所有標籤（依網域）
 */
async function autoGroupAllTabs() {
  return await autoGroupByDomain();
}

/**
 * 依網域自動分組
 */
async function autoGroupByDomain() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const settings = await getSettings();

  // 依網域分類標籤
  const domainMap = new Map();

  for (const tab of tabs) {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.pinned) continue;

    try {
      const url = new URL(tab.url);
      const domain = url.hostname.replace(/^www\./, '');

      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain).push(tab.id);
    } catch (e) {
      // 無效 URL，跳過
    }
  }

  // 建立群組（只為有 2 個以上標籤的網域建立）
  let groupsCreated = 0;
  const colorIndex = { current: 0 };

  for (const [domain, tabIds] of domainMap) {
    if (tabIds.length >= 2) {
      // 檢查是否已在同一群組
      const firstTab = await chrome.tabs.get(tabIds[0]);
      if (firstTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
        // 已有群組，將其他標籤加入
        const groupTabs = await chrome.tabs.query({ groupId: firstTab.groupId });
        const existingTabIds = new Set(groupTabs.map(t => t.id));
        const newTabIds = tabIds.filter(id => !existingTabIds.has(id));

        if (newTabIds.length > 0) {
          await chrome.tabs.group({ tabIds: newTabIds, groupId: firstTab.groupId });
        }
      } else {
        // 建立新群組
        const groupId = await chrome.tabs.group({ tabIds });
        const color = GROUP_COLORS[colorIndex.current % GROUP_COLORS.length];
        colorIndex.current++;

        await chrome.tabGroups.update(groupId, {
          title: formatDomainTitle(domain),
          color: color,
          collapsed: settings.collapseOnCreate
        });
        groupsCreated++;
      }
    }
  }

  return { groupsCreated, tabsGrouped: Array.from(domainMap.values()).flat().length };
}

/**
 * 自動將單一標籤加入群組
 */
async function autoGroupTab(tab) {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.pinned) return;

  try {
    const url = new URL(tab.url);
    const domain = url.hostname.replace(/^www\./, '');

    // 查找相同網域的群組
    const tabs = await chrome.tabs.query({ currentWindow: true });

    for (const existingTab of tabs) {
      if (existingTab.id === tab.id || existingTab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE) continue;

      try {
        const existingUrl = new URL(existingTab.url);
        const existingDomain = existingUrl.hostname.replace(/^www\./, '');

        if (existingDomain === domain) {
          // 找到相同網域的群組，加入
          await chrome.tabs.group({ tabIds: [tab.id], groupId: existingTab.groupId });
          return;
        }
      } catch (e) {
        // 無效 URL，跳過
      }
    }
  } catch (e) {
    // 無效 URL，跳過
  }
}

/**
 * 移動標籤到群組
 */
async function moveTabToGroup(tabId, groupId) {
  if (groupId === -1) {
    await chrome.tabs.ungroup([tabId]);
  } else {
    await chrome.tabs.group({ tabIds: [tabId], groupId });
  }
}

/**
 * 儲存群組範本
 */
async function saveTemplate(template) {
  const settings = await getSettings();
  const templates = settings.templates || [];

  template.id = Date.now().toString();
  templates.push(template);

  await saveSettings({ ...settings, templates });
}

/**
 * 套用群組範本
 */
async function applyTemplate(templateId) {
  const settings = await getSettings();
  const template = settings.templates?.find(t => t.id === templateId);

  if (!template) throw new Error('Template not found');

  // 收合所有現有群組
  await collapseAllGroups(true);

  // 依範本建立群組
  for (const group of template.groups) {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const matchingTabs = tabs.filter(tab => {
      if (!tab.url) return false;
      try {
        const url = new URL(tab.url);
        const domain = url.hostname.replace(/^www\./, '');
        return group.domains.some(d => domain.includes(d));
      } catch {
        return false;
      }
    });

    if (matchingTabs.length > 0) {
      const tabIds = matchingTabs.map(t => t.id);
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: group.title,
        color: group.color
      });
    }
  }
}

/**
 * 刪除範本
 */
async function deleteTemplate(templateId) {
  const settings = await getSettings();
  settings.templates = settings.templates?.filter(t => t.id !== templateId) || [];
  await saveSettings(settings);
}

/**
 * 取得所有範本
 */
async function getTemplates() {
  const settings = await getSettings();
  return settings.templates || [];
}

/**
 * 取得設定
 */
async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...result.settings };
}

/**
 * 儲存設定
 */
async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}

/**
 * 格式化網域名稱作為群組標題
 */
function formatDomainTitle(domain) {
  // 移除常見後綴，首字母大寫
  const name = domain
    .replace(/\.(com|org|net|io|dev|co|app)$/, '')
    .split('.')
    .pop();

  return name.charAt(0).toUpperCase() + name.slice(1);
}
