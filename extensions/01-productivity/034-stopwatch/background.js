// Stopwatch - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      stopwatchState: {
        isRunning: false,
        startTime: 0,
        elapsedTime: 0,
        laps: []
      },
      stopwatchHistory: []
    });
    console.log('Stopwatch extension installed');
  }
});

// Update badge based on state
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['stopwatchState']);
    const state = result.stopwatchState;

    if (state && state.isRunning) {
      chrome.action.setBadgeText({ text: '▶' });
      chrome.action.setBadgeBackgroundColor({ color: '#ff6b6b' });
    } else if (state && state.elapsedTime > 0) {
      chrome.action.setBadgeText({ text: '⏸' });
      chrome.action.setBadgeBackgroundColor({ color: '#feca57' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Badge update error:', error);
  }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.stopwatchState) {
    updateBadge();
  }
});

// Initialize badge on startup
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});
