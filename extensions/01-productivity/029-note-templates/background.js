// Note Templates - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      customTemplates: []
    });
    console.log('Note Templates extension installed');
  }
});
