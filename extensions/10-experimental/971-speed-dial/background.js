// Background service worker for Speed Dial
chrome.runtime.onInstalled.addListener(() => {
  console.log('Speed Dial installed.');

  // Initialize with default speed dial entries
  chrome.storage.local.set({
    speedDials: [
      { id: 1, title: 'Google', url: 'https://www.google.com', color: '#4285f4' },
      { id: 2, title: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000' },
      { id: 3, title: 'GitHub', url: 'https://github.com', color: '#333' },
      { id: 4, title: 'Twitter', url: 'https://twitter.com', color: '#1da1f2' }
    ],
    folders: [],
    background: 'gradient',
    showClock: true,
    showWeather: false,
    searchEngine: 'google'
  });
});

// Handle speed dial operations
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ADD_SPEED_DIAL') {
    chrome.storage.local.get(['speedDials'], (data) => {
      const dials = data.speedDials || [];
      dials.push({
        id: Date.now(),
        title: message.title,
        url: message.url,
        color: message.color || getRandomColor(),
        folderId: message.folderId || null
      });
      chrome.storage.local.set({ speedDials: dials });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'REMOVE_SPEED_DIAL') {
    chrome.storage.local.get(['speedDials'], (data) => {
      const dials = data.speedDials || [];
      const filtered = dials.filter(d => d.id !== message.id);
      chrome.storage.local.set({ speedDials: filtered });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_TOP_SITES') {
    chrome.topSites.get((sites) => {
      sendResponse({ success: true, sites: sites.slice(0, 8) });
    });
    return true;
  }

  if (message.type === 'IMPORT_BOOKMARKS') {
    chrome.bookmarks.getTree((tree) => {
      const bookmarks = flattenBookmarks(tree);
      sendResponse({ success: true, bookmarks: bookmarks.slice(0, 20) });
    });
    return true;
  }
});

function flattenBookmarks(nodes, result = []) {
  nodes.forEach(node => {
    if (node.url) {
      result.push({ title: node.title, url: node.url });
    }
    if (node.children) {
      flattenBookmarks(node.children, result);
    }
  });
  return result;
}

function getRandomColor() {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22'];
  return colors[Math.floor(Math.random() * colors.length)];
}
