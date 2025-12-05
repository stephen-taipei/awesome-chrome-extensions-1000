document.addEventListener('DOMContentLoaded', () => {
  const syncBtn = document.getElementById('sync-btn');
  const lastSyncedEl = document.getElementById('last-synced');
  
  syncBtn.addEventListener('click', () => {
    const originalText = syncBtn.textContent;
    syncBtn.textContent = 'Syncing...';
    syncBtn.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
      syncBtn.textContent = 'Success!';
      lastSyncedEl.textContent = 'Just now';
      
      // Save timestamp
      chrome.storage.local.set({ lastSync: new Date().toISOString() });
      
      setTimeout(() => {
        syncBtn.textContent = originalText;
        syncBtn.disabled = false;
      }, 1500);
    }, 1000);
  });

  // Load timestamp
  chrome.storage.local.get(['lastSync'], (result) => {
    if (result.lastSync) {
      const date = new Date(result.lastSync);
      lastSyncedEl.textContent = date.toLocaleTimeString();
    }
  });
});
