// Voice Note - Background Service Worker
// Handles extension lifecycle and badge updates

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on install
    chrome.storage.local.set({
      voiceNoteLanguage: 'zh-TW',
      voiceNotes: []
    });

    console.log('Voice Note extension installed');
  }
});

// Update badge with notes count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['voiceNotes']);
    const notes = result.voiceNotes || [];
    const count = notes.length;

    if (count > 0) {
      chrome.action.setBadgeText({ text: count > 99 ? '99+' : String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.voiceNotes) {
    updateBadge();
  }
});

// Update badge on startup
updateBadge();
