document.addEventListener('DOMContentLoaded', () => {
  const tabFavicon = document.getElementById('tabFavicon');
  const tabTitle = document.getElementById('tabTitle');
  const intervalBtns = document.querySelectorAll('.interval-btn');
  const customInput = document.getElementById('customSeconds');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusEl = document.getElementById('status');
  const countdownEl = document.getElementById('countdownTime');

  let currentTabId = null;
  let selectedInterval = 30;
  let isRefreshing = false;
  let countdownInterval = null;
  let nextRefreshTime = null;

  // Get current tab info
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    currentTabId = tab.id;
    tabTitle.textContent = tab.title;
    tabFavicon.src = tab.favIconUrl || '';

    // Check if already refreshing
    chrome.storage.local.get(['refreshTabs'], (result) => {
      const refreshTabs = result.refreshTabs || {};
      if (refreshTabs[currentTabId]) {
        isRefreshing = true;
        selectedInterval = refreshTabs[currentTabId].interval;
        nextRefreshTime = refreshTabs[currentTabId].nextRefresh;
        updateUI();
        startCountdown();
      }
    });
  });

  function updateUI() {
    // Update interval buttons
    intervalBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.seconds) === selectedInterval);
    });

    // Update status
    if (isRefreshing) {
      statusEl.classList.add('active');
      statusEl.querySelector('.status-icon').textContent = '🔄';
      statusEl.querySelector('.status-text').textContent = `Refreshing every ${formatInterval(selectedInterval)}`;
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusEl.classList.remove('active');
      statusEl.querySelector('.status-icon').textContent = '⏸️';
      statusEl.querySelector('.status-text').textContent = 'Not refreshing';
      startBtn.disabled = false;
      stopBtn.disabled = true;
      countdownEl.textContent = '--';
    }
  }

  function formatInterval(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  }

  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
      if (!nextRefreshTime) return;

      const remaining = Math.max(0, Math.ceil((nextRefreshTime - Date.now()) / 1000));
      countdownEl.textContent = `${remaining}s`;

      if (remaining <= 0) {
        nextRefreshTime = Date.now() + selectedInterval * 1000;
      }
    }, 100);
  }

  function startRefresh() {
    isRefreshing = true;
    nextRefreshTime = Date.now() + selectedInterval * 1000;

    chrome.storage.local.get(['refreshTabs'], (result) => {
      const refreshTabs = result.refreshTabs || {};
      refreshTabs[currentTabId] = {
        interval: selectedInterval,
        nextRefresh: nextRefreshTime
      };
      chrome.storage.local.set({ refreshTabs });
    });

    chrome.runtime.sendMessage({
      type: 'startRefresh',
      tabId: currentTabId,
      interval: selectedInterval
    });

    updateUI();
    startCountdown();
  }

  function stopRefresh() {
    isRefreshing = false;
    if (countdownInterval) clearInterval(countdownInterval);

    chrome.storage.local.get(['refreshTabs'], (result) => {
      const refreshTabs = result.refreshTabs || {};
      delete refreshTabs[currentTabId];
      chrome.storage.local.set({ refreshTabs });
    });

    chrome.runtime.sendMessage({
      type: 'stopRefresh',
      tabId: currentTabId
    });

    updateUI();
  }

  // Event listeners
  intervalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedInterval = parseInt(btn.dataset.seconds);
      customInput.value = '';
      updateUI();
    });
  });

  customInput.addEventListener('input', () => {
    const value = parseInt(customInput.value);
    if (value > 0) {
      selectedInterval = value;
      intervalBtns.forEach(btn => btn.classList.remove('active'));
    }
  });

  startBtn.addEventListener('click', startRefresh);
  stopBtn.addEventListener('click', stopRefresh);
});
