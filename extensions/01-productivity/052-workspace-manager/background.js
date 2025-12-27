// Workspace Manager - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      workspaces: [],
      currentWorkspaceId: null
    });
    console.log('Workspace Manager extension installed');
  }
});
