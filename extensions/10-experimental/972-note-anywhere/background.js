// Background service worker for Note Anywhere
chrome.runtime.onInstalled.addListener(() => {
  console.log('Note Anywhere installed.');

  chrome.storage.local.set({
    notes: {},
    noteColors: ['#ffeb3b', '#ff9800', '#f44336', '#4caf50', '#2196f3', '#9c27b0'],
    defaultColor: '#ffeb3b'
  });
});

// Handle note operations
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_NOTE') {
    chrome.storage.local.get(['notes'], (data) => {
      const notes = data.notes || {};
      const url = message.url;
      if (!notes[url]) notes[url] = [];

      const existingIndex = notes[url].findIndex(n => n.id === message.note.id);
      if (existingIndex >= 0) {
        notes[url][existingIndex] = message.note;
      } else {
        notes[url].push({
          ...message.note,
          id: message.note.id || Date.now(),
          createdAt: new Date().toISOString()
        });
      }

      chrome.storage.local.set({ notes });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_NOTES') {
    chrome.storage.local.get(['notes'], (data) => {
      const notes = data.notes || {};
      sendResponse({ success: true, notes: notes[message.url] || [] });
    });
    return true;
  }

  if (message.type === 'DELETE_NOTE') {
    chrome.storage.local.get(['notes'], (data) => {
      const notes = data.notes || {};
      if (notes[message.url]) {
        notes[message.url] = notes[message.url].filter(n => n.id !== message.noteId);
        chrome.storage.local.set({ notes });
      }
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'SEARCH_NOTES') {
    chrome.storage.local.get(['notes'], (data) => {
      const notes = data.notes || {};
      const results = [];
      const query = message.query.toLowerCase();

      Object.entries(notes).forEach(([url, pageNotes]) => {
        pageNotes.forEach(note => {
          if (note.content.toLowerCase().includes(query)) {
            results.push({ ...note, url });
          }
        });
      });

      sendResponse({ success: true, results });
    });
    return true;
  }
});
