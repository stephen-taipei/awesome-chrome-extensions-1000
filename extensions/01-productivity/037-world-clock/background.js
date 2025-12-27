// World Clock - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      worldClocks: [
        { city: '東京', tz: 'Asia/Tokyo', country: '日本' },
        { city: '倫敦', tz: 'Europe/London', country: '英國' },
        { city: '紐約', tz: 'America/New_York', country: '美國' }
      ]
    });
    console.log('World Clock extension installed');
  }
});

// Update badge with current local time
function updateBadge() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  chrome.action.setBadgeText({ text: `${hours}:${minutes}` });
  chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
}

// Update badge every minute
chrome.alarms.create('updateBadge', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateBadge') {
    updateBadge();
  }
});

// Initialize
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

updateBadge();
