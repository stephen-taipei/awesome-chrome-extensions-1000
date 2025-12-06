document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('masterToggle');
  const siteInput = document.getElementById('siteInput');
  const addSiteBtn = document.getElementById('addSite');
  const blockedList = document.getElementById('blockedList');
  const blockCountEl = document.getElementById('blockCount');
  const quickBtns = document.querySelectorAll('.quick-btn');

  let blockedSites = [];
  let isEnabled = true;

  // Load settings
  chrome.storage.local.get(['blockedSites', 'isEnabled'], (result) => {
    blockedSites = result.blockedSites || [];
    isEnabled = result.isEnabled !== false;
    masterToggle.checked = isEnabled;
    renderBlockedSites();
  });

  function renderBlockedSites() {
    blockCountEl.textContent = `${blockedSites.length} site${blockedSites.length !== 1 ? 's' : ''} blocked`;

    if (blockedSites.length === 0) {
      blockedList.innerHTML = `
        <div class="empty-state">
          <div class="icon">🛡️</div>
          <p>No websites blocked yet</p>
        </div>
      `;
      return;
    }

    blockedList.innerHTML = blockedSites.map(site => `
      <div class="blocked-item" data-site="${site}">
        <div class="site-info">
          <img class="favicon" src="https://www.google.com/s2/favicons?domain=${site}&sz=32"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>'">
          <span class="site-name">${site}</span>
        </div>
        <button class="remove-btn">Remove</button>
      </div>
    `).join('');

    // Add remove listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const site = btn.closest('.blocked-item').dataset.site;
        removeSite(site);
      });
    });
  }

  function addSite(site) {
    // Clean up the site URL
    site = site.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '');

    if (!site) return;

    if (blockedSites.includes(site)) {
      siteInput.value = '';
      return;
    }

    blockedSites.push(site);
    saveAndRender();
    siteInput.value = '';
  }

  function removeSite(site) {
    blockedSites = blockedSites.filter(s => s !== site);
    saveAndRender();
  }

  function saveAndRender() {
    chrome.storage.local.set({ blockedSites, isEnabled }, () => {
      renderBlockedSites();
      // Notify background script
      chrome.runtime.sendMessage({ type: 'updateBlockList' });
    });
  }

  // Event listeners
  addSiteBtn.addEventListener('click', () => addSite(siteInput.value));

  siteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addSite(siteInput.value);
    }
  });

  masterToggle.addEventListener('change', () => {
    isEnabled = masterToggle.checked;
    chrome.storage.local.set({ isEnabled }, () => {
      chrome.runtime.sendMessage({ type: 'updateBlockList' });
    });
  });

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      addSite(btn.dataset.site);
    });
  });
});
