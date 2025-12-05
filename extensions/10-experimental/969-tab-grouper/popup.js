document.addEventListener('DOMContentLoaded', () => {
  const tabCountEl = document.getElementById('tab-count');
  const groupCountEl = document.getElementById('group-count');

  loadStats();

  // Group all tabs
  document.getElementById('group-all').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GROUP_ALL_TABS' }, () => {
      setTimeout(loadStats, 500);
    });
  });

  // Ungroup all
  document.getElementById('ungroup-all').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'UNGROUP_ALL' }, () => {
      setTimeout(loadStats, 500);
    });
  });

  // Settings toggles
  chrome.storage.local.get(['autoGroup', 'groupByDomain'], (data) => {
    document.getElementById('auto-group').checked = data.autoGroup !== false;
    document.getElementById('group-domain').checked = data.groupByDomain !== false;
  });

  document.getElementById('auto-group').addEventListener('change', (e) => {
    chrome.storage.local.set({ autoGroup: e.target.checked });
  });

  document.getElementById('group-domain').addEventListener('change', (e) => {
    chrome.storage.local.set({ groupByDomain: e.target.checked });
  });

  function loadStats() {
    chrome.tabs.query({}, (tabs) => {
      tabCountEl.textContent = tabs.length;
    });

    chrome.tabGroups.query({}, (groups) => {
      groupCountEl.textContent = groups.length;
    });
  }
});
