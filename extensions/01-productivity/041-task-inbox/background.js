// Task Inbox - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ inboxTasks: [] });
    console.log('Task Inbox extension installed');
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    const count = message.count;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
  }
});

// Update badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['inboxTasks']);
  const tasks = result.inboxTasks || [];
  const incompleteCount = tasks.filter(t => !t.completed).length;

  chrome.action.setBadgeText({ text: incompleteCount > 0 ? incompleteCount.toString() : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
});
