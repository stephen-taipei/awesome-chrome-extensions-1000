// Background service worker for Tab Grouper
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Grouper installed.');

  chrome.storage.local.set({
    autoGroup: true,
    groupByDomain: true,
    customRules: [],
    groupColors: {
      'social': 'blue',
      'work': 'green',
      'shopping': 'yellow',
      'entertainment': 'red',
      'news': 'purple'
    },
    categoryKeywords: {
      'social': ['facebook', 'twitter', 'instagram', 'linkedin', 'reddit'],
      'work': ['github', 'gitlab', 'jira', 'slack', 'notion', 'docs.google'],
      'shopping': ['amazon', 'ebay', 'shopify', 'etsy'],
      'entertainment': ['youtube', 'netflix', 'spotify', 'twitch'],
      'news': ['cnn', 'bbc', 'nytimes', 'reuters']
    }
  });
});

// Auto-group new tabs
chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.local.get(['autoGroup'], (data) => {
    if (data.autoGroup && tab.url) {
      groupTab(tab);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['autoGroup'], (data) => {
      if (data.autoGroup) {
        groupTab(tab);
      }
    });
  }
});

async function groupTab(tab) {
  if (!tab.url || tab.url.startsWith('chrome://')) return;

  const category = await categorizeTab(tab.url);
  if (!category) return;

  chrome.storage.local.get(['groupColors'], async (data) => {
    const color = data.groupColors[category] || 'grey';

    // Find existing group or create new
    const groups = await chrome.tabGroups.query({ title: category });
    if (groups.length > 0) {
      chrome.tabs.group({ tabIds: tab.id, groupId: groups[0].id });
    } else {
      const groupId = await chrome.tabs.group({ tabIds: tab.id });
      chrome.tabGroups.update(groupId, { title: category, color });
    }
  });
}

async function categorizeTab(url) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['categoryKeywords', 'groupByDomain'], (data) => {
      const urlLower = url.toLowerCase();

      for (const [category, keywords] of Object.entries(data.categoryKeywords)) {
        if (keywords.some(kw => urlLower.includes(kw))) {
          resolve(category);
          return;
        }
      }

      if (data.groupByDomain) {
        try {
          const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
          resolve(domain);
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GROUP_ALL_TABS') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => groupTab(tab));
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'UNGROUP_ALL') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => chrome.tabs.ungroup(tab.id));
      sendResponse({ success: true });
    });
    return true;
  }
});
