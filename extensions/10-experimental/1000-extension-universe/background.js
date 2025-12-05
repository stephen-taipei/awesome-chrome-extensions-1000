// Background service worker for Extension Universe
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Universe installed.');
  chrome.storage.local.set({ 
    settings: {
      autoScan: true,
      notifications: true
    }
  });
});

// Listen for new extensions being installed or uninstalled
chrome.management.onInstalled.addListener((info) => {
  notifyChange('New extension installed: ' + info.name);
  updateRegistry();
});

chrome.management.onUninstalled.addListener((id) => {
  // We only get ID on uninstall, not name directly unless we cached it.
  notifyChange('Extension uninstalled');
  updateRegistry();
});

chrome.management.onEnabled.addListener((info) => {
  notifyChange('Extension enabled: ' + info.name);
  updateRegistry();
});

chrome.management.onDisabled.addListener((info) => {
  notifyChange('Extension disabled: ' + info.name);
  updateRegistry();
});

function notifyChange(message) {
  chrome.storage.local.get(['settings'], (result) => {
    if (result.settings && result.settings.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Extension Universe',
        message: message
      });
    }
  });
}

function updateRegistry() {
  chrome.management.getAll((extensions) => {
    const activeExtensions = extensions.filter(ext => ext.enabled && ext.type === 'extension');
    chrome.storage.local.set({ knownExtensions: activeExtensions });
  });
}
