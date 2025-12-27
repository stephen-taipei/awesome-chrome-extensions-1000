// Priority Matrix - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      priorityMatrixTasks: {
        do: [],
        schedule: [],
        delegate: [],
        delete: []
      }
    });
    console.log('Priority Matrix extension installed');
  }
});
