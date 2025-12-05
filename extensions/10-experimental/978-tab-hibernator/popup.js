document.addEventListener('DOMContentLoaded', () => {
  const activeTabsEl = document.getElementById('active-tabs');
  const hibernatedTabsEl = document.getElementById('hibernated-tabs');
  const memorySavedEl = document.getElementById('memory-saved');
  const tabsContainer = document.getElementById('tabs-container');

  // Load tab data
  function loadTabs() {
    chrome.tabs.query({}, (tabs) => {
      activeTabsEl.textContent = tabs.length;
      renderTabs(tabs);
    });

    chrome.storage.local.get(['hibernatedTabs', 'totalMemorySaved'], (data) => {
      const hibernated = data.hibernatedTabs || [];
      hibernatedTabsEl.textContent = hibernated.length;
      memorySavedEl.textContent = `${data.totalMemorySaved || 0} MB`;
    });
  }

  function renderTabs(tabs) {
    tabsContainer.innerHTML = tabs.slice(0, 10).map(tab => `
      <div class="tab-item" data-tab-id="${tab.id}">
        <span class="tab-favicon">${tab.favIconUrl ? `<img src="${tab.favIconUrl}" width="16">` : '🌐'}</span>
        <span class="tab-title">${escapeHtml(tab.title?.substring(0, 30) || 'Untitled')}${tab.title?.length > 30 ? '...' : ''}</span>
        <button class="hibernate-btn" data-tab-id="${tab.id}">${tab.discarded ? '☀️' : '💤'}</button>
      </div>
    `).join('');

    // Add hibernate button handlers
    document.querySelectorAll('.hibernate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tabId = parseInt(btn.dataset.tabId);
        chrome.tabs.get(tabId, (tab) => {
          if (tab.discarded) {
            chrome.tabs.reload(tabId);
          } else {
            chrome.tabs.discard(tabId);
          }
          setTimeout(loadTabs, 500);
        });
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Hibernate all
  document.getElementById('hibernate-all').addEventListener('click', () => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (!tab.active) chrome.tabs.discard(tab.id);
      });
      setTimeout(loadTabs, 500);
    });
  });

  // Wake all
  document.getElementById('wake-all').addEventListener('click', () => {
    chrome.tabs.query({ discarded: true }, (tabs) => {
      tabs.forEach(tab => chrome.tabs.reload(tab.id));
      setTimeout(loadTabs, 500);
    });
  });

  // Settings
  chrome.storage.local.get(['autoHibernate', 'idleTimeout'], (data) => {
    document.getElementById('auto-hibernate').checked = data.autoHibernate !== false;
    document.getElementById('idle-timeout').value = data.idleTimeout || 30;
  });

  document.getElementById('auto-hibernate').addEventListener('change', (e) => {
    chrome.storage.local.set({ autoHibernate: e.target.checked });
  });

  document.getElementById('idle-timeout').addEventListener('change', (e) => {
    chrome.storage.local.set({ idleTimeout: parseInt(e.target.value) });
  });

  loadTabs();
});
