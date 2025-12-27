// Focus Mode - Background Service Worker

let focusState = {
  isActive: false,
  strictMode: false,
  endTime: 0
};

let blockedSites = [];

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const today = new Date().toDateString();
    chrome.storage.local.set({
      focusModeState: {
        isActive: false,
        strictMode: false,
        endTime: 0,
        duration: 45
      },
      focusModeSettings: {
        blockedSites: ['facebook.com', 'twitter.com', 'youtube.com', 'instagram.com']
      },
      focusModeStats: {
        todaySessions: 0,
        todayMinutes: 0,
        blockedAttempts: 0,
        date: today
      }
    });
    console.log('Focus Mode extension installed');
  }

  // Create check alarm
  chrome.alarms.create('focusModeCheck', { periodInMinutes: 1 / 60 }); // Every second
});

// Load initial state
async function loadState() {
  const result = await chrome.storage.local.get(['focusModeState', 'focusModeSettings']);
  if (result.focusModeState) {
    focusState = result.focusModeState;
  }
  if (result.focusModeSettings) {
    blockedSites = result.focusModeSettings.blockedSites || [];
  }
  updateBadge();
}

loadState();

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'startFocus':
    case 'stopFocus':
      loadState();
      break;
  }
});

// Check and block sites
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'focusModeCheck') {
    await loadState();

    if (!focusState.isActive) {
      updateBadge();
      return;
    }

    // Check if session ended
    if (focusState.endTime <= Date.now()) {
      focusState.isActive = false;
      focusState.strictMode = false;
      await chrome.storage.local.set({ focusModeState: focusState });
      updateBadge();
      return;
    }

    // Check current tabs
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && isBlockedSite(tab.url)) {
          await blockTab(tab.id);
        }
      }
    } catch (error) {
      console.error('Tab check error:', error);
    }

    updateBadge();
  }
});

// Check when tab is updated
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && focusState.isActive) {
    if (isBlockedSite(changeInfo.url)) {
      await blockTab(tabId);
    }
  }
});

function isBlockedSite(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    return blockedSites.some(site => hostname.includes(site));
  } catch {
    return false;
  }
}

async function blockTab(tabId) {
  try {
    // Increment blocked attempts
    const result = await chrome.storage.local.get(['focusModeStats']);
    const stats = result.focusModeStats || {};
    stats.blockedAttempts = (stats.blockedAttempts || 0) + 1;
    await chrome.storage.local.set({ focusModeStats: stats });

    // Inject blocking page
    await chrome.scripting.executeScript({
      target: { tabId },
      func: showBlockPage,
      args: [focusState.endTime, focusState.strictMode]
    });
  } catch (error) {
    console.error('Block error:', error);
  }
}

function showBlockPage(endTime, strictMode) {
  // Don't block if already blocked
  if (document.getElementById('focus-mode-blocker')) return;

  const remaining = Math.max(0, endTime - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const blocker = document.createElement('div');
  blocker.id = 'focus-mode-blocker';
  blocker.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: white;
  `;

  blocker.innerHTML = `
    <div style="font-size: 64px; margin-bottom: 20px;">🎯</div>
    <h1 style="font-size: 32px; margin-bottom: 10px;">專注模式進行中</h1>
    <p style="font-size: 18px; opacity: 0.9; margin-bottom: 30px;">這個網站目前被封鎖</p>
    <div style="font-size: 48px; font-weight: bold; font-variant-numeric: tabular-nums;">
      ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
    </div>
    <p style="margin-top: 10px; opacity: 0.8;">剩餘時間</p>
    ${strictMode ? '<p style="margin-top: 40px; font-size: 14px; opacity: 0.6;">🔒 嚴格模式 - 無法中途關閉</p>' : ''}
    <button id="focus-go-back" style="
      margin-top: 40px;
      padding: 12px 32px;
      border: 2px solid white;
      border-radius: 8px;
      background: transparent;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    ">← 返回上一頁</button>
  `;

  document.body.appendChild(blocker);

  document.getElementById('focus-go-back').addEventListener('click', () => {
    history.back();
  });

  // Update timer
  setInterval(() => {
    const now = Date.now();
    const rem = Math.max(0, endTime - now);
    const m = Math.floor(rem / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    const timerEl = blocker.querySelector('div[style*="font-variant-numeric"]');
    if (timerEl) {
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    if (rem <= 0) {
      blocker.remove();
    }
  }, 1000);
}

async function updateBadge() {
  if (focusState.isActive) {
    const remaining = Math.ceil((focusState.endTime - Date.now()) / 60000);
    chrome.action.setBadgeText({ text: remaining > 0 ? remaining.toString() : '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#6c5ce7' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  loadState();
  chrome.alarms.create('focusModeCheck', { periodInMinutes: 1 / 60 });
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.focusModeState) {
      focusState = changes.focusModeState.newValue || focusState;
    }
    if (changes.focusModeSettings) {
      blockedSites = changes.focusModeSettings.newValue?.blockedSites || [];
    }
    updateBadge();
  }
});
