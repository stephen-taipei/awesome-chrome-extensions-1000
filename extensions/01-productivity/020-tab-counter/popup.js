document.addEventListener('DOMContentLoaded', () => {
  const totalTabsEl = document.getElementById('totalTabs');
  const windowCountEl = document.getElementById('windowCount');
  const pinnedCountEl = document.getElementById('pinnedCount');
  const audioCountEl = document.getElementById('audioCount');
  const domainsListEl = document.getElementById('domainsList');
  const dupeCountEl = document.getElementById('dupeCount');
  const closeAllDupesBtn = document.getElementById('closeAllDupes');
  const memoryFillEl = document.getElementById('memoryFill');
  const memoryTextEl = document.getElementById('memoryText');

  let allTabs = [];
  let duplicateTabs = [];

  // Get all tabs and update stats
  updateStats();

  async function updateStats() {
    const windows = await chrome.windows.getAll({ populate: true });
    allTabs = [];
    let pinnedCount = 0;
    let audioCount = 0;
    const domains = {};

    windows.forEach(win => {
      win.tabs.forEach(tab => {
        allTabs.push(tab);
        if (tab.pinned) pinnedCount++;
        if (tab.audible) audioCount++;

        try {
          const url = new URL(tab.url);
          const domain = url.hostname.replace('www.', '');
          domains[domain] = (domains[domain] || 0) + 1;
        } catch (e) {}
      });
    });

    // Update counts
    totalTabsEl.textContent = allTabs.length;
    windowCountEl.textContent = windows.length;
    pinnedCountEl.textContent = pinnedCount;
    audioCountEl.textContent = audioCount;

    // Find duplicates
    const urlCount = {};
    allTabs.forEach(tab => {
      urlCount[tab.url] = (urlCount[tab.url] || 0) + 1;
    });
    duplicateTabs = allTabs.filter(tab => urlCount[tab.url] > 1);
    const dupeUrls = new Set(duplicateTabs.map(t => t.url));
    dupeCountEl.textContent = duplicateTabs.length - dupeUrls.size;

    // Top domains
    const sortedDomains = Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedDomains.length === 0) {
      domainsListEl.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.5);font-size:12px;">No domains</div>';
    } else {
      domainsListEl.innerHTML = sortedDomains.map(([domain, count]) => `
        <div class="domain-item">
          <span class="domain-name">${domain}</span>
          <span class="domain-count">${count}</span>
        </div>
      `).join('');
    }

    // Estimate memory (rough estimate: ~50MB per tab)
    const estimatedMB = allTabs.length * 50;
    const percentage = Math.min(100, (allTabs.length / 50) * 100);
    memoryFillEl.style.width = percentage + '%';
    memoryTextEl.textContent = `~${estimatedMB} MB (${allTabs.length} tabs)`;
  }

  async function closeDuplicates() {
    const urlSeen = {};
    const tabsToClose = [];

    allTabs.forEach(tab => {
      if (urlSeen[tab.url]) {
        tabsToClose.push(tab.id);
      } else {
        urlSeen[tab.url] = true;
      }
    });

    if (tabsToClose.length > 0) {
      await chrome.tabs.remove(tabsToClose);
      updateStats();
    }
  }

  closeAllDupesBtn.addEventListener('click', closeDuplicates);
});
