/**
 * Tab Stash - Background Service Worker
 * 標籤暫存管理
 */

// IndexedDB 設定
const DB_NAME = 'TabStashDB';
const DB_VERSION = 1;
const STORE_NAME = 'stashes';

// 預設設定
const DEFAULT_SETTINGS = {
  closeAfterStash: true,
  autoCleanupDays: 30,
  defaultStashName: 'auto',
  confirmBeforeRestore: false
};

/**
 * 初始化
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    await initDB();
    console.log('Tab Stash installed successfully');
  }
});

/**
 * 監聽快捷鍵
 */
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'stash-all') {
    await stashAllTabs();
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
      case 'getStashes':
        const stashes = await getAllStashes();
        sendResponse({ success: true, data: stashes });
        break;

      case 'stashAllTabs':
        const stash = await stashAllTabs(message.name);
        sendResponse({ success: true, data: stash });
        break;

      case 'stashSelectedTabs':
        const selectedStash = await stashSelectedTabs(message.tabIds, message.name);
        sendResponse({ success: true, data: selectedStash });
        break;

      case 'restoreStash':
        await restoreStash(message.stashId, message.closeAfterRestore);
        sendResponse({ success: true });
        break;

      case 'restoreTab':
        await restoreTab(message.stashId, message.tabIndex);
        sendResponse({ success: true });
        break;

      case 'deleteStash':
        await deleteStash(message.stashId);
        sendResponse({ success: true });
        break;

      case 'deleteTab':
        await deleteTabFromStash(message.stashId, message.tabIndex);
        sendResponse({ success: true });
        break;

      case 'renameStash':
        await renameStash(message.stashId, message.newName);
        sendResponse({ success: true });
        break;

      case 'exportStashes':
        const exportData = await exportStashes(message.format);
        sendResponse({ success: true, data: exportData });
        break;

      case 'importStashes':
        const importResult = await importStashes(message.data);
        sendResponse({ success: true, data: importResult });
        break;

      case 'getSettings':
        const settings = await getSettings();
        sendResponse({ success: true, data: settings });
        break;

      case 'saveSettings':
        await saveSettings(message.settings);
        sendResponse({ success: true });
        break;

      case 'getCurrentTabs':
        const tabs = await getCurrentTabs();
        sendResponse({ success: true, data: tabs });
        break;

      case 'cleanupOldStashes':
        const cleaned = await cleanupOldStashes();
        sendResponse({ success: true, data: cleaned });
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
 * 初始化 IndexedDB
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };
  });
}

/**
 * 取得資料庫連線
 */
function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };
  });
}

/**
 * 取得所有暫存組
 */
async function getAllStashes() {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const stashes = request.result.sort((a, b) => b.createdAt - a.createdAt);
      resolve(stashes);
    };
  });
}

/**
 * 暫存所有標籤
 */
async function stashAllTabs(name) {
  const settings = await getSettings();
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // 過濾掉 chrome:// 頁面
  const validTabs = tabs.filter(tab =>
    tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')
  );

  if (validTabs.length === 0) {
    throw new Error('沒有可暫存的標籤');
  }

  const stash = {
    id: generateId(),
    name: name || generateStashName(settings.defaultStashName),
    createdAt: Date.now(),
    tabs: validTabs.map(tab => ({
      title: tab.title || 'New Tab',
      url: tab.url,
      favIconUrl: tab.favIconUrl || '',
      pinned: tab.pinned
    }))
  };

  await saveStash(stash);

  // 關閉標籤
  if (settings.closeAfterStash) {
    const tabIds = validTabs.map(t => t.id);
    // 保留至少一個標籤
    if (tabIds.length === tabs.length) {
      await chrome.tabs.create({ url: 'chrome://newtab' });
    }
    await chrome.tabs.remove(tabIds);
  }

  return stash;
}

/**
 * 暫存選定的標籤
 */
async function stashSelectedTabs(tabIds, name) {
  const settings = await getSettings();
  const allTabs = await chrome.tabs.query({ currentWindow: true });
  const selectedTabs = allTabs.filter(tab => tabIds.includes(tab.id));

  const validTabs = selectedTabs.filter(tab =>
    tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')
  );

  if (validTabs.length === 0) {
    throw new Error('沒有可暫存的標籤');
  }

  const stash = {
    id: generateId(),
    name: name || generateStashName(settings.defaultStashName),
    createdAt: Date.now(),
    tabs: validTabs.map(tab => ({
      title: tab.title || 'New Tab',
      url: tab.url,
      favIconUrl: tab.favIconUrl || '',
      pinned: tab.pinned
    }))
  };

  await saveStash(stash);

  if (settings.closeAfterStash) {
    await chrome.tabs.remove(tabIds);
  }

  return stash;
}

/**
 * 儲存暫存組
 */
async function saveStash(stash) {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(stash);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 恢復暫存組
 */
async function restoreStash(stashId, closeAfterRestore = true) {
  const db = await getDB();

  const stash = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(stashId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

  if (!stash) {
    throw new Error('找不到暫存組');
  }

  // 開啟所有標籤
  for (const tab of stash.tabs) {
    await chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      active: false
    });
  }

  // 刪除暫存組
  if (closeAfterRestore) {
    await deleteStash(stashId);
  }
}

/**
 * 恢復單一標籤
 */
async function restoreTab(stashId, tabIndex) {
  const db = await getDB();

  const stash = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(stashId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

  if (!stash || !stash.tabs[tabIndex]) {
    throw new Error('找不到標籤');
  }

  const tab = stash.tabs[tabIndex];
  await chrome.tabs.create({
    url: tab.url,
    pinned: tab.pinned
  });

  // 從暫存組移除
  await deleteTabFromStash(stashId, tabIndex);
}

/**
 * 刪除暫存組
 */
async function deleteStash(stashId) {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(stashId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 從暫存組刪除標籤
 */
async function deleteTabFromStash(stashId, tabIndex) {
  const db = await getDB();

  const stash = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(stashId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

  if (!stash) return;

  stash.tabs.splice(tabIndex, 1);

  // 如果沒有標籤了，刪除整個暫存組
  if (stash.tabs.length === 0) {
    await deleteStash(stashId);
  } else {
    await saveStash(stash);
  }
}

/**
 * 重命名暫存組
 */
async function renameStash(stashId, newName) {
  const db = await getDB();

  const stash = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(stashId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

  if (!stash) {
    throw new Error('找不到暫存組');
  }

  stash.name = newName;
  await saveStash(stash);
}

/**
 * 匯出暫存組
 */
async function exportStashes(format = 'json') {
  const stashes = await getAllStashes();

  if (format === 'json') {
    return JSON.stringify(stashes, null, 2);
  }

  if (format === 'html') {
    return generateBookmarkHTML(stashes);
  }

  throw new Error('不支援的匯出格式');
}

/**
 * 產生書籤 HTML
 */
function generateBookmarkHTML(stashes) {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Tab Stash Export</TITLE>
<H1>Tab Stash Export</H1>
<DL><p>
`;

  for (const stash of stashes) {
    const date = new Date(stash.createdAt);
    const dateStr = date.toISOString().split('T')[0];

    html += `    <DT><H3>${escapeHtml(stash.name)} (${dateStr})</H3>\n`;
    html += `    <DL><p>\n`;

    for (const tab of stash.tabs) {
      html += `        <DT><A HREF="${escapeHtml(tab.url)}">${escapeHtml(tab.title)}</A>\n`;
    }

    html += `    </DL><p>\n`;
  }

  html += `</DL><p>`;
  return html;
}

/**
 * 匯入暫存組
 */
async function importStashes(data) {
  let stashes;

  try {
    stashes = JSON.parse(data);
  } catch {
    throw new Error('無效的 JSON 格式');
  }

  if (!Array.isArray(stashes)) {
    throw new Error('無效的資料格式');
  }

  let imported = 0;

  for (const stash of stashes) {
    if (stash.id && stash.tabs && Array.isArray(stash.tabs)) {
      // 產生新的 ID 避免衝突
      stash.id = generateId();
      stash.createdAt = stash.createdAt || Date.now();
      await saveStash(stash);
      imported++;
    }
  }

  return { imported };
}

/**
 * 清理過期暫存組
 */
async function cleanupOldStashes() {
  const settings = await getSettings();
  const stashes = await getAllStashes();
  const cutoff = Date.now() - (settings.autoCleanupDays * 24 * 60 * 60 * 1000);

  let cleaned = 0;

  for (const stash of stashes) {
    if (stash.createdAt < cutoff) {
      await deleteStash(stash.id);
      cleaned++;
    }
  }

  return { cleaned };
}

/**
 * 取得當前標籤
 */
async function getCurrentTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  return tabs
    .filter(tab => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
    .map(tab => ({
      id: tab.id,
      title: tab.title || 'New Tab',
      url: tab.url,
      favIconUrl: tab.favIconUrl || '',
      pinned: tab.pinned,
      active: tab.active
    }));
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
 * 產生唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 產生暫存組名稱
 */
function generateStashName(mode) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW');
  const timeStr = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

  if (mode === 'auto') {
    return `${dateStr} ${timeStr}`;
  }

  return `暫存 - ${dateStr}`;
}

/**
 * HTML 跳脫
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
