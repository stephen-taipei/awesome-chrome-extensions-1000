// Background service worker for Mind Mapper
chrome.runtime.onInstalled.addListener(() => {
  console.log('Mind Mapper installed.');

  chrome.storage.local.set({
    autoMapping: true,
    sessionNodes: [],
    connections: [],
    snapshots: []
  });
});

// Track page visits for mind mapping
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['sessionNodes', 'connections', 'autoMapping'], (data) => {
      if (!data.autoMapping) return;

      const nodes = data.sessionNodes || [];
      const connections = data.connections || [];

      // Create new node
      const newNode = {
        id: Date.now(),
        url: tab.url,
        title: tab.title,
        timestamp: new Date().toISOString(),
        concepts: extractConcepts(tab.title)
      };

      // Find connections to existing nodes
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        connections.push({
          from: lastNode.id,
          to: newNode.id,
          type: 'navigation'
        });
      }

      nodes.push(newNode);
      chrome.storage.local.set({ sessionNodes: nodes, connections });
    });
  }
});

function extractConcepts(title) {
  if (!title) return [];
  return title.split(/[\s\-|:]+/).filter(word => word.length > 3).slice(0, 5);
}

// Handle snapshot requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_SNAPSHOT') {
    chrome.storage.local.get(['sessionNodes', 'connections', 'snapshots'], (data) => {
      const snapshots = data.snapshots || [];
      snapshots.push({
        id: Date.now(),
        name: message.name || `Snapshot ${snapshots.length + 1}`,
        nodes: data.sessionNodes,
        connections: data.connections,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ snapshots });
      sendResponse({ success: true });
    });
    return true;
  }
});
