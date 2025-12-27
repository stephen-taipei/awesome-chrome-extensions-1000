// Bookmark Notes - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      bookmarkNotes: {}
    });
    console.log('Bookmark Notes extension installed');
  }
});

// Update badge with notes count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['bookmarkNotes']);
    const notes = result.bookmarkNotes || {};
    const count = Object.values(notes).filter(n => n.note).length;

    if (count > 0) {
      chrome.action.setBadgeText({ text: count > 99 ? '99+' : String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#f5576c' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.bookmarkNotes) {
    updateBadge();
  }
});

// Clean up notes when bookmarks are deleted
chrome.bookmarks.onRemoved.addListener(async (id) => {
  try {
    const result = await chrome.storage.local.get(['bookmarkNotes']);
    const notes = result.bookmarkNotes || {};

    if (notes[id]) {
      delete notes[id];
      await chrome.storage.local.set({ bookmarkNotes: notes });
    }
  } catch (error) {
    console.error('Failed to clean up notes:', error);
  }
});

updateBadge();
