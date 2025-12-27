// Project Timer - Background Service Worker

// Keep track of active timer
chrome.runtime.onInstalled.addListener(() => {
  // Initialize badge
  updateBadge();
});

chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

async function updateBadge() {
  const result = await chrome.storage.local.get('projectTimerData');
  const data = result.projectTimerData;

  if (data?.activeTimer && !data.activeTimer.isPaused) {
    chrome.action.setBadgeText({ text: '●' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.projectTimerData) {
    updateBadge();
  }
});
