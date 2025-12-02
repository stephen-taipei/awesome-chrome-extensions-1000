/**
 * Tab Suspender - Background Service Worker
 * 自動暫停閒置標籤以節省記憶體
 */

// 預設設定
const DEFAULT_SETTINGS = {
  enabled: true,
  suspendAfterMinutes: 30,
  suspendPinned: false,
  suspendAudible: false,
  suspendActive: false,
  whitelist: [],
  showNotification: false,
  ignoreFormInput: true
};

// 標籤活動時間追蹤
const tabActivity = new Map();

// 警報名稱
const ALARM_NAME = 'tab-suspender-check';
const CHECK_INTERVAL_MINUTES = 1;

/**
 * 初始化
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    console.log('Tab Suspender installed successfully');
  }

  // 初始化所有標籤的活動時間
  const tabs = await chrome.tabs.query({});
  const now = Date.now();
  for (const tab of tabs) {
    tabActivity.set(tab.id, now);
  }

  // 設定定時檢查
  await setupAlarm();
});

/**
 * 設定定時警報
 */
async function setupAlarm() {
  const settings = await getSettings();
  if (settings.enabled) {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: CHECK_INTERVAL_MINUTES
    });
  } else {
    chrome.alarms.clear(ALARM_NAME);
  }
}

/**
 * 警報觸發
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await checkAndSuspendTabs();
  }
});

/**
 * 標籤被啟動時更新活動時間
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  tabActivity.set(activeInfo.tabId, Date.now());
});

/**
 * 標籤更新時更新活動時間
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.audible !== undefined) {
    tabActivity.set(tabId, Date.now());
  }
});

/**
 * 標籤關閉時清除追蹤
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  tabActivity.delete(tabId);
});

/**
 * 新標籤建立時追蹤
 */
chrome.tabs.onCreated.addListener((tab) => {
  tabActivity.set(tab.id, Date.now());
});

/**
 * 監聽快捷鍵
 */
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'suspend-current':
      await suspendCurrentTab();
      break;
    case 'suspend-others':
      await suspendOtherTabs();
      break;
  }
});

/**
 * 訊息處理
 */
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
      case 'getStatus':
        const status = await getTabsStatus();
        sendResponse({ success: true, data: status });
        break;

      case 'suspendTab':
        await suspendTab(message.tabId);
        sendResponse({ success: true });
        break;

      case 'suspendCurrentTab':
        await suspendCurrentTab();
        sendResponse({ success: true });
        break;

      case 'suspendOtherTabs':
        await suspendOtherTabs();
        sendResponse({ success: true });
        break;

      case 'suspendAllTabs':
        await suspendAllTabs();
        sendResponse({ success: true });
        break;

      case 'unsuspendTab':
        await unsuspendTab(message.tabId);
        sendResponse({ success: true });
        break;

      case 'unsuspendAllTabs':
        await unsuspendAllTabs();
        sendResponse({ success: true });
        break;

      case 'addToWhitelist':
        await addToWhitelist(message.url);
        sendResponse({ success: true });
        break;

      case 'removeFromWhitelist':
        await removeFromWhitelist(message.url);
        sendResponse({ success: true });
        break;

      case 'getSettings':
        const settings = await getSettings();
        sendResponse({ success: true, data: settings });
        break;

      case 'saveSettings':
        await saveSettings(message.settings);
        await setupAlarm();
        sendResponse({ success: true });
        break;

      case 'getTabActivity':
        const activity = tabActivity.get(message.tabId) || Date.now();
        sendResponse({ success: true, data: activity });
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
 * 檢查並暫停閒置標籤
 */
async function checkAndSuspendTabs() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const now = Date.now();
  const suspendThreshold = settings.suspendAfterMinutes * 60 * 1000;

  for (const tab of tabs) {
    // 跳過不應暫停的標籤
    if (shouldSkipTab(tab, settings)) continue;

    // 檢查是否已暫停
    if (tab.discarded) continue;

    // 檢查活動時間
    const lastActivity = tabActivity.get(tab.id) || now;
    const idleTime = now - lastActivity;

    if (idleTime >= suspendThreshold) {
      await suspendTab(tab.id);
    }
  }
}

/**
 * 判斷是否應跳過此標籤
 */
function shouldSkipTab(tab, settings) {
  // 跳過活動標籤
  if (tab.active && !settings.suspendActive) return true;

  // 跳過釘選標籤
  if (tab.pinned && !settings.suspendPinned) return true;

  // 跳過播放音訊的標籤
  if (tab.audible && !settings.suspendAudible) return true;

  // 跳過 Chrome 內部頁面
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return true;
  }

  // 跳過新標籤頁
  if (tab.url === 'chrome://newtab/') return true;

  // 檢查白名單
  if (isWhitelisted(tab.url, settings.whitelist)) return true;

  return false;
}

/**
 * 檢查 URL 是否在白名單中
 */
function isWhitelisted(url, whitelist) {
  if (!url || !whitelist || whitelist.length === 0) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return whitelist.some(pattern => {
      const p = pattern.toLowerCase();
      // 支援萬用字元
      if (p.startsWith('*.')) {
        const domain = p.slice(2);
        return hostname.endsWith(domain) || hostname === domain.slice(1);
      }
      return hostname === p || hostname.endsWith('.' + p);
    });
  } catch {
    return false;
  }
}

/**
 * 暫停指定標籤
 */
async function suspendTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);

    // 檢查是否可以暫停
    if (tab.discarded) return;
    if (!tab.url || tab.url.startsWith('chrome://')) return;

    // 使用 Chrome 內建的 discard 功能
    await chrome.tabs.discard(tabId);

    console.log(`Tab ${tabId} suspended`);
  } catch (error) {
    console.error(`Failed to suspend tab ${tabId}:`, error);
  }
}

/**
 * 暫停當前標籤
 */
async function suspendCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await suspendTab(tab.id);
  }
}

/**
 * 暫停其他標籤
 */
async function suspendOtherTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const settings = await getSettings();

  for (const tab of tabs) {
    if (tab.id === activeTab?.id) continue;
    if (shouldSkipTab(tab, { ...settings, suspendActive: false })) continue;
    await suspendTab(tab.id);
  }
}

/**
 * 暫停所有標籤
 */
async function suspendAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const settings = await getSettings();

  for (const tab of tabs) {
    if (shouldSkipTab(tab, { ...settings, suspendActive: true })) continue;
    await suspendTab(tab.id);
  }
}

/**
 * 恢復標籤
 */
async function unsuspendTab(tabId) {
  try {
    // 重新載入標籤以恢復
    await chrome.tabs.reload(tabId);
    tabActivity.set(tabId, Date.now());
  } catch (error) {
    console.error(`Failed to unsuspend tab ${tabId}:`, error);
  }
}

/**
 * 恢復所有標籤
 */
async function unsuspendAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true, discarded: true });

  for (const tab of tabs) {
    await unsuspendTab(tab.id);
  }
}

/**
 * 取得所有標籤狀態
 */
async function getTabsStatus() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const settings = await getSettings();
  const now = Date.now();

  return tabs.map(tab => {
    const lastActivity = tabActivity.get(tab.id) || now;
    const idleMinutes = Math.floor((now - lastActivity) / 60000);

    return {
      id: tab.id,
      title: tab.title || 'New Tab',
      url: tab.url || '',
      favIconUrl: tab.favIconUrl || '',
      suspended: tab.discarded,
      active: tab.active,
      pinned: tab.pinned,
      audible: tab.audible,
      idleMinutes,
      whitelisted: isWhitelisted(tab.url, settings.whitelist),
      canSuspend: !shouldSkipTab(tab, settings) && !tab.discarded
    };
  });
}

/**
 * 新增到白名單
 */
async function addToWhitelist(url) {
  const settings = await getSettings();

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (!settings.whitelist.includes(hostname)) {
      settings.whitelist.push(hostname);
      await saveSettings(settings);
    }
  } catch (error) {
    console.error('Failed to add to whitelist:', error);
  }
}

/**
 * 從白名單移除
 */
async function removeFromWhitelist(url) {
  const settings = await getSettings();

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    settings.whitelist = settings.whitelist.filter(h => h !== hostname);
    await saveSettings(settings);
  } catch (error) {
    console.error('Failed to remove from whitelist:', error);
  }
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

// 初始化警報
setupAlarm();
